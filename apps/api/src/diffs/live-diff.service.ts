import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaClient } from '@dbsnap/database';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { BACKUP_QUEUE, DIFF_QUEUE } from '../queues/queue.constants';

@Injectable()
export class LiveDiffService {
    constructor(
        @Inject('PRISMA_CLIENT') private prisma: PrismaClient,
        @InjectQueue(BACKUP_QUEUE) private backupQueue: Queue,
        @InjectQueue(DIFF_QUEUE) private diffQueue: Queue,
    ) { }

    async triggerLiveDiff(databaseId: string, baseSnapshotId: string, userId: string) {
        // 1. Verify Ownership & Existence
        const database = await this.prisma.database.findUnique({
            where: { id: databaseId },
            include: { project: true },
        });

        if (!database) throw new NotFoundException('Database not found');
        if (database.project.userId !== userId) throw new NotFoundException('Database not found');

        const baseSnapshot = await this.prisma.backup.findUnique({
            where: { id: baseSnapshotId },
        });
        if (!baseSnapshot) throw new NotFoundException('Base snapshot not found');

        // 2. Create Ephemeral Backup Record Placeholder
        const liveBackupId = uuidv4();

        // 3. Trigger Live Backup Job (Ephemeral)
        // We set expiresAt to 1 hour from now for auto-cleanup (if implemented later)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        await this.backupQueue.add('create-backup', {
            databaseId: database.id,
            backupId: liveBackupId,
            isEphemeral: true,
            expiresAt,
        });

        // 4. Create Diff Record Placeholder
        const diffId = uuidv4();
        await this.prisma.diff.create({
            data: {
                id: diffId,
                snapshotAId: baseSnapshot.id,
                snapshotBId: liveBackupId,
                status: 'Pending',
            }
        });

        // 5. Trigger Diff Job
        // Note: Diff Job needs to wait for Backup to complete.
        // Ideally, we chain them. But BullMQ chaining is complex without FlowProducer.
        // Simple hack: DiffProcessor retries until Snapshot B is ready? No, wasteful.
        // Better: We rely on the BackupProcessor to trigger the Diff? No, coupling.
        // Workaround: We add a delay? Unreliable.
        // Proper fix: FlowProducer.
        // MVP Fix: We use `completed` event listener? No, worker is separate.
        // MVP Decision: We add the Diff Job immediately, but the DiffProcessor
        // MUST check if Snapshot B is 'Completed'. If not, throw error (trigger retry).
        // Since we have retries in BullMQ, this serves as a poor-man's polling.

        await this.diffQueue.add('generate-diff', {
            diffId,
            snapshotAId: baseSnapshot.id,
            snapshotBId: liveBackupId,
        }, {
            delay: 5000, // 5s initial delay
            attempts: 20, // Retry for ~2-3 minutes
            backoff: {
                type: 'fixed',
                delay: 5000 // Retry every 5s
            }
        });

        return { diffId, liveBackupId };
    }
}
