import { Job } from 'bullmq';
import { prisma } from '../prisma.js';
import { SqlDiffEngine } from '../diff/sql-diff.engine.js';
import { MongoDiffEngine } from '../diff/mongo-diff.engine.js';
import { StorageFactory } from '../storage/storage.factory.js';
import { createLogger, getConfig } from '@dbsnap/shared';
import { DatabaseType } from '../snapshots/snapshot-engine.js';
import { pushNotification } from '../utils/notifications.js';

const logger = createLogger('diff-processor');
const config = getConfig();

const storageAdapter = StorageFactory.createAdapter({
    driver: config.NODE_ENV === 'production' ? 's3' : 'local',
    local: { baseDir: './storage' },
});

export async function processDiffJob(job: Job) {
    const { snapshotAId, snapshotBId } = job.data;
    const jobId = job.id;

    logger.info(`Starting diff job ${jobId} for snapshots ${snapshotAId} vs ${snapshotBId}`);

    try {
        // 1. Fetch Snapshot Metadata
        const [snapshotA, snapshotB] = await Promise.all([
            prisma.backupSnapshot.findUnique({ where: { id: snapshotAId }, include: { connection: true } }),
            prisma.backupSnapshot.findUnique({ where: { id: snapshotBId }, include: { connection: true } }),
        ]);

        if (!snapshotA || !snapshotB) {
            throw new Error(`One or both snapshots not found: ${snapshotAId}, ${snapshotBId}`);
        }

        if (snapshotA.connection.type !== snapshotB.connection.type) {
            throw new Error(`Cannot compare different database types: ${snapshotA.connection.type} vs ${snapshotB.connection.type}`);
        }

        if (!snapshotA.storagePath || !snapshotB.storagePath) {
            throw new Error(`One or both snapshots are missing storage paths`);
        }

        // 2. Select Engine
        const dbType = snapshotA.connection.type as DatabaseType;
        let engine;

        if (dbType === DatabaseType.MONGODB) {
            engine = new MongoDiffEngine(storageAdapter);
        } else {
            engine = new SqlDiffEngine(storageAdapter);
        }

        // 3. Run Comparison
        logger.info(`Running comparison using ${dbType} engine...`);
        const result = await engine.compare(snapshotA.storagePath, snapshotB.storagePath);

        // 4. Save Result
        const resultKey = await engine.saveResult(result);

        await pushNotification({
            type: 'diff',
            status: 'completed',
            connectionId: snapshotA.connectionId,
            resultKey
        });

        logger.info(`Diff job ${jobId} completed successfully. Result saved to: ${resultKey}`);

        return {
            status: 'success',
            resultKey,
            summary: result.summary
        };

    } catch (err: any) {
        logger.error(`Diff job ${jobId} failed: ${err.message}`);

        // Try to get connectionId from job data or snapshots if available
        const connectionId = job.data.snapshotAId ? (await prisma.backupSnapshot.findUnique({ where: { id: job.data.snapshotAId } }))?.connectionId : undefined;

        await pushNotification({
            type: 'diff',
            status: 'failed',
            connectionId,
            details: err.message
        });

        throw err;
    }
}
