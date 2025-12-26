import { Job, Queue } from 'bullmq';
import { prisma } from '../prisma.js';
import { createLogger, QueueNames, getRedisConnection } from '@dbsnap/shared';
import { SnapshotStatus } from '@dbsnap/database';

const logger = createLogger('threshold-processor');
let notificationQueue: Queue | null = null;

function getNotificationQueue() {
    if (!notificationQueue) {
        notificationQueue = new Queue(QueueNames.NOTIFICATIONS, {
            connection: getRedisConnection(),
        });
    }
    return notificationQueue;
}

export async function processThresholdJob(job: Job) {
    const { snapshotId, connectionId } = job.data;
    const jobId = job.id;

    logger.info(`Starting threshold check for snapshot ${snapshotId} (connection ${connectionId})`);

    try {
        // 1. Fetch current snapshot
        const currentSnapshot = await prisma.backupSnapshot.findUnique({
            where: { id: snapshotId },
            include: { connection: { include: { project: { include: { organization: { include: { users: true } } } } } } }
        });

        if (!currentSnapshot || !currentSnapshot.sizeBytes) {
            logger.warn(`Snapshot ${snapshotId} not found or has no size info`);
            return;
        }

        // 2. Find previous successful snapshot
        const previousSnapshot = await prisma.backupSnapshot.findFirst({
            where: {
                connectionId,
                status: SnapshotStatus.COMPLETED,
                id: { not: snapshotId },
                completedAt: { lt: currentSnapshot.completedAt || new Date() }
            },
            orderBy: { completedAt: 'desc' }
        });

        if (!previousSnapshot || !previousSnapshot.sizeBytes) {
            logger.info(`No previous successful snapshot found for connection ${connectionId}. Skipping threshold check.`);
            return;
        }

        const currentSize = Number(currentSnapshot.sizeBytes);
        const previousSize = Number(previousSnapshot.sizeBytes);
        const growth = (currentSize - previousSize) / previousSize;

        logger.info(`Growth detected: ${(growth * 100).toFixed(2)}% (Current: ${currentSize}, Previous: ${previousSize})`);

        // 3. Threshold check (default 20%)
        if (growth > 0.20) {
            logger.warn(`Growth anomaly detected for connection ${currentSnapshot.connection.name}: ${(growth * 100).toFixed(2)}%`);

            const queue = getNotificationQueue();
            const users = currentSnapshot.connection.project.organization.users;

            for (const user of users) {
                await queue.add('send-notification', {
                    type: 'snapshot',
                    status: 'alert',
                    userEmail: user.email,
                    connectionName: currentSnapshot.connection.name,
                    details: `Unusual growth detected: ${(growth * 100).toFixed(2)}% increase in snapshot size.`,
                });
            }
        }

    } catch (err: any) {
        logger.error(`Threshold check job ${jobId} failed: ${err.message}`);
        throw err;
    }
}
