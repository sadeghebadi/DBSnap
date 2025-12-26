import { Job } from 'bullmq';
import { prisma } from '../prisma.js';
import { SnapshotEngine, DatabaseType } from '../snapshots/snapshot-engine.js';
import { StorageFactory } from '../storage/storage.factory.js';
import { decrypt, createLogger, getConfig } from '@dbsnap/shared';
import { SnapshotStatus } from '@dbsnap/database';

const logger = createLogger('snapshot-processor');

const snapshotEngine = new SnapshotEngine();
const config = getConfig();

// Initialize storage adapter from global config
const storageAdapter = StorageFactory.createAdapter({
    driver: config.NODE_ENV === 'production' ? 's3' : 'local',
    local: { baseDir: './storage' },
    // S3 config would be pulled from env if driver is 's3'
});

export async function processSnapshotJob(job: Job) {
    const { projectId, connectionId } = job.data;
    const jobId = job.id;

    logger.info(`Starting snapshot job ${jobId} for project ${projectId}`);

    // Create or find snapshot record
    let snapshot = await prisma.backupSnapshot.findFirst({
        where: {
            connectionId,
            status: SnapshotStatus.PENDING
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!snapshot) {
        snapshot = await prisma.backupSnapshot.create({
            data: {
                connectionId,
                status: SnapshotStatus.PENDING
            }
        });
    }

    try {
        // 1. Fetch and Decrypt Connection
        const connection = await prisma.databaseConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        const decryptedPassword = decrypt(connection.password);

        // 2. Update Status to RUNNING
        await prisma.backupSnapshot.update({
            where: { id: snapshot.id },
            data: {
                status: SnapshotStatus.RUNNING,
                startedAt: new Date()
            }
        });

        // 3. Create Snapshot Stream
        const { stream, hashStream, metadata } = await snapshotEngine.createSnapshotStream(
            connection.type as DatabaseType,
            {
                host: connection.host,
                port: connection.port,
                database: connection.databaseName,
                username: connection.username,
                password: decryptedPassword,
            },
            true // Enable compression
        );

        // 4. Upload to Storage
        const fileKey = `snapshots/${projectId}/${snapshot.id}.jsonl.gz`;
        const uploadResult = await storageAdapter.upload(fileKey, stream);

        // 5. Update Status to COMPLETED
        await prisma.backupSnapshot.update({
            where: { id: snapshot.id },
            data: {
                status: SnapshotStatus.COMPLETED,
                completedAt: new Date(),
                storagePath: fileKey,
                sizeBytes: BigInt(uploadResult.size || 0),
            }
        });

        logger.info(`Snapshot job ${jobId} completed successfully. Path: ${fileKey}`);

    } catch (err: any) {
        logger.error(`Snapshot job ${jobId} failed: ${err.message}`);

        await prisma.backupSnapshot.update({
            where: { id: snapshot.id },
            data: {
                status: SnapshotStatus.FAILED,
                errorMessage: err.message,
                completedAt: new Date()
            }
        });

        throw err; // Let BullMQ handle retry if configured
    }
}
