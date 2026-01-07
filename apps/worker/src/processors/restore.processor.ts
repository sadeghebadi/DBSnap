import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { RESTORE_QUEUE } from '../queues/queue.constants';
import { RestorerFactory } from '../restorers/restorer.factory';
import { EncryptionService } from '../encryption/encryption.service';
import { StorageService } from '../storage/storage.service';
import { PrismaClient } from '@dbsnap/database';

@Processor(RESTORE_QUEUE)
export class RestoreProcessor extends WorkerHost {
    private readonly logger = new Logger(RestoreProcessor.name);

    constructor(
        private restorerFactory: RestorerFactory,
        private encryptionService: EncryptionService,
        private storageService: StorageService,
        @Inject('PRISMA_CLIENT') private prisma: PrismaClient
    ) {
        super();
    }

    async process(job: Job<{
        backupId: string;
        targetDatabaseId: string;
        backupKey?: string;
        iv?: string;
        authTag?: string;
        tables?: string[];
        mode?: 'append' | 'overwrite';
    }, any, string>): Promise<any> {
        this.logger.log(`Processing restore job ${job.id} for backup ${job.data.backupId} to DB ${job.data.targetDatabaseId}`);

        try {
            // 1. Fetch Restore Details
            const backupKey = job.data.backupKey || 'mock-key';
            const ivHex = job.data.iv;
            const authTagHex = job.data.authTag;

            if (!ivHex || !authTagHex) {
                // In a real scenario, fetch these from DB via backupId
                this.logger.warn('Missing IV/AuthTag in job data. Using defaults/mock for dev.');
                // throw new Error('Missing encryption metadata');
            }

            const targetDb = await this.prisma.database.findUnique({
                where: { id: job.data.targetDatabaseId }
            });
            if (!targetDb) throw new Error('Target DB not found');

            // 2. Decrypt Target DB Connection
            const connectionString = this.encryptionService.decrypt({
                iv: targetDb.iv,
                content: targetDb.connectionStringEnc,
                authTag: targetDb.authTag
            });

            // 3. Create Restorer
            const restorer = this.restorerFactory.createRestorer(targetDb.type);

            // 4. Download Stream from S3
            const s3Stream = await this.storageService.downloadStream(backupKey);

            // 5. Decrypt Stream
            // We default to empty strings if missing (which will fail crypto, but satisfy types)
            // Ideally we fail early.
            const decryptStream = this.encryptionService.createDecryptionStream(ivHex || '', authTagHex || '');

            // 6. Pipeline: S3 -> Decrypt -> Restore
            s3Stream.pipe(decryptStream);

            const { tables, mode } = job.data;

            this.logger.log(`Starting restore... Mode: ${mode || 'append'}, Tables: ${tables?.join(',') || 'ALL'}`);
            await restorer.restore(connectionString, decryptStream, { tables, mode });

            this.logger.log(`Restore complete.`);
            return { success: true };

        } catch (error: any) {
            this.logger.error(`Restore failed: ${error.message}`, error.stack);
            throw error;
        }
    }
}
