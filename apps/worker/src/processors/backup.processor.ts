import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { BACKUP_QUEUE_NAME } from '../queues/backup.queue';
import { DumperFactory } from '../dumpers/dumper.factory';
import { EncryptionService } from '../encryption/encryption.service';
import { StorageService } from '../storage/storage.service';
import { PrismaClient } from '@dbsnap/database';

@Processor(BACKUP_QUEUE_NAME)
export class BackupProcessor extends WorkerHost {
    private readonly logger = new Logger(BackupProcessor.name);

    constructor(
        private dumperFactory: DumperFactory,
        private encryptionService: EncryptionService,
        private storageService: StorageService,
        @Inject('PRISMA_CLIENT') private prisma: PrismaClient
    ) {
        super();
    }

    async process(job: Job<{ databaseId: string }, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.id} for database ${job.data.databaseId}`);

        try {
            // 1. Fetch Database Details
            const database = await this.prisma.database.findUnique({
                where: { id: job.data.databaseId }
            });

            if (!database) {
                throw new Error(`Database not found: ${job.data.databaseId}`);
            }

            // 2. Decrypt Connection String
            const connectionString = this.encryptionService.decrypt({
                iv: database.iv,
                content: database.connectionStringEnc,
                authTag: database.authTag
            });

            // 3. Create Dumper
            const dumper = this.dumperFactory.createDumper(database.type);

            // 4. Encryption Setup
            const { iv, stream: encryptStream } = this.encryptionService.createEncryptionStream();

            // 5. Prepare S3 Upload Stream
            const key = `backups/${database.projectId}/${database.id}/${new Date().toISOString()}-${job.id}.enc`;
            this.logger.log(`Uploading encrypted backup to S3 key: ${key}`);

            const { writeStream, done } = this.storageService.uploadStream(key);

            // 6. Pipeline: Dumper -> Encrypt -> S3
            // EncryptStream pipes to S3 WriteStream
            encryptStream.pipe(writeStream);

            this.logger.log(`Starting backup pipeline...`);

            // Execute Dump -> Write to EncryptStream
            const dumpPromise = dumper.dump(connectionString, encryptStream);

            // Wait for both dump to finish and upload to finish
            const [metadata] = await Promise.all([dumpPromise, done]);

            // Get AuthTag after stream is done
            const authTag = encryptStream.getAuthTag();

            this.logger.log(`Backup complete. Rows: ${metadata.totalRows}. S3 Key: ${key}`);
            this.logger.log(`Encryption IV: ${iv.toString('hex')}, AuthTag: ${authTag.toString('hex')}`);

            // 7. Update Backup Record (Mocked / TODO)
            return {
                success: true,
                metadata,
                key,
                encryption: {
                    iv: iv.toString('hex'),
                    authTag: authTag.toString('hex')
                }
            };

        } catch (error: any) {
            this.logger.error(`Backup failed: ${error.message}`, error.stack);
            throw error;
        }
    }
}
