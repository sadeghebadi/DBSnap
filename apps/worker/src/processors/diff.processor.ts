import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@dbsnap/database';
import { EncryptionService } from '../encryption/encryption.service';
import { StorageService } from '../storage/storage.service';
import { MongoDiffEngine, SqlDiffEngine, DiffResult } from '@dbsnap/diff-engine';
import { EmailService } from '../email/email.service';
import { Readable } from 'stream';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);

import { DIFF_QUEUE } from '../queues/queue.constants';

@Processor(DIFF_QUEUE)
export class DiffProcessor extends WorkerHost {
    private readonly logger = new Logger(DiffProcessor.name);
    private readonly mongoDiff = new MongoDiffEngine();
    private readonly sqlDiff = new SqlDiffEngine();

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
        private readonly encryptionService: EncryptionService,
        private readonly storageService: StorageService,
        private readonly emailService: EmailService
    ) {
        super();
    }

    async process(job: Job<{ diffId: string, snapshotAId: string, snapshotBId: string }>) {
        const { diffId, snapshotAId, snapshotBId } = job.data;
        this.logger.log(`Starting diff generation for ${diffId} (A: ${snapshotAId}, B: ${snapshotBId})`);

        try {
            await this.prisma.diff.update({
                where: { id: diffId },
                data: { status: 'Processing' },
            });

            // 1. Fetch Backups
            const snapshotA = await this.prisma.backup.findUniqueOrThrow({
                where: { id: snapshotAId },
                include: { database: true },
            });
            const snapshotB = await this.prisma.backup.findUniqueOrThrow({
                where: { id: snapshotBId },
                include: { database: true },
            });

            // Pre-flight check: Ensure both backups are Completed
            if (snapshotA.status !== 'Completed' || snapshotB.status !== 'Completed') {
                const msg = `Snapshots not ready (A: ${snapshotA.status}, B: ${snapshotB.status})`;
                this.logger.warn(msg);
                // Throw error to trigger BullMQ retry
                throw new Error(msg);
            }

            // 2. Get Streams
            const streamA = await this.getDecryptedStream(snapshotA);
            const streamB = await this.getDecryptedStream(snapshotB);

            // 3. Compare
            let result: DiffResult;
            if (snapshotA.database.type === 'MongoDB') {
                result = await this.mongoDiff.compare(
                    streamA,
                    streamB,
                    snapshotA.metadata as any,
                    snapshotB.metadata as any
                );
            } else {
                // Assumption: ID is primary key for now. 
                // In production this should come from metadata or configured via UI.
                result = await this.sqlDiff.compare(
                    streamA,
                    streamB,
                    { primaryKey: 'id' },
                    snapshotA.metadata as any,
                    snapshotB.metadata as any
                );
            }

            // 4. Update Diff Record
            const schemaSummary = result.schemaChanges ? {
                schema: result.schemaChanges
            } : {};

            await this.prisma.diff.update({
                where: { id: diffId },
                data: {
                    status: 'Completed',
                    added: result.added,
                    removed: result.removed,
                    modified: result.modified,
                    summary: schemaSummary,
                    // s3DetailKey would be set if we were uploading full diff JSONL
                    // For now we just store counting stats and schema changes
                }
            });

            this.logger.log(`Diff completed for ${diffId}: +${result.added} -${result.removed} ~${result.modified}`);

            // Notify User
            await this.emailService.sendDiffReady('user@example.com', { // TODO: Fetch user email
                diffId,
                summary: `+${result.added} -${result.removed} ~${result.modified}`
            });

        } catch (error: any) {
            this.logger.error(`Diff failed for ${diffId}`, error.stack);

            // Only mark as Failed if it's NOT a retry-able error (like missing snapshot)
            // But for simplicity/MVP, we mark failed status in DB so UI shows it,
            // while BullMQ might still retry depending on config.
            // Actually, if we throw, BullMQ retries. If we update DB to failed, UI shows failed.
            // If we want "Waiting", we shouldn't update to Failed if it's just 'not ready'.
            // But we already set 'Processing'.

            // Decided: If it's a "Snapshots not ready" error, keep it 'Processing' (or set 'Pending'?)
            // and throw so it retries.
            if (error.message.includes('Snapshots not ready')) {
                throw error; // Retry without updating DB to Failed
            }

            await this.prisma.diff.update({
                where: { id: diffId },
                data: { status: 'Failed' },
            });
            throw error;
        }
    }

    private async getDecryptedStream(backup: any): Promise<Readable> {
        const metadata = backup.metadata as any;
        const key = backup.s3Key;
        const iv = metadata?.encryption?.iv;
        const authTag = metadata?.encryption?.authTag;

        if (!key || !iv || !authTag) {
            throw new Error(`Missing encryption metadata for backup ${backup.id}`);
        }

        const downloadStream = await this.storageService.downloadStream(key);
        const decipher = this.encryptionService.createDecryptionStream(iv, authTag);

        // We return the pipe, ensuring error propagation handled by caller or stream consumption
        return downloadStream.pipe(decipher);
    }
}
