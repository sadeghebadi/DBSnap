import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { BACKUP_QUEUE } from '../queues/queue.constants';
import { DumperFactory } from '../dumpers/dumper.factory';
import { EncryptionService } from '../encryption/encryption.service';
import { StorageService } from '../storage/storage.service';
import { PrismaClient } from '@dbsnap/database';
import { AnalysisService } from '../analysis/analysis.service';
import { NotificationOrchestratorService } from '../notifications/notification-orchestrator.service';

@Processor(BACKUP_QUEUE)
export class BackupProcessor extends WorkerHost {
    private readonly logger = new Logger(BackupProcessor.name);

    constructor(
        private dumperFactory: DumperFactory,
        private encryptionService: EncryptionService,
        private storageService: StorageService,
        @Inject('PRISMA_CLIENT') private prisma: PrismaClient,
        private notificationOrchestrator: NotificationOrchestratorService,
        private analysisService: AnalysisService
    ) {
        super();
    }

    async process(job: Job<{ databaseId: string, backupId?: string, isEphemeral?: boolean, expiresAt?: string }, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.id} for database ${job.data.databaseId}`);
        const { databaseId, backupId, isEphemeral, expiresAt } = job.data;

        try {
            // 0. Update Backup Status to InProgress (if ID provided)
            if (backupId) {
                await this.prisma.backup.update({
                    where: { id: backupId },
                    data: { status: 'InProgress' }
                });
            }

            // 1. Fetch Database Details
            const database = await this.prisma.database.findUnique({
                where: { id: databaseId }
            });

            if (!database) {
                throw new Error(`Database not found: ${databaseId}`);
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
            encryptStream.pipe(writeStream);

            this.logger.log(`Starting backup pipeline...`);

            // Execute Dump -> Write to EncryptStream
            const dumpPromise = dumper.dump(connectionString, encryptStream);

            // Wait for both dump to finish and upload to finish
            const [metadata] = await Promise.all([dumpPromise, done]);

            // Get AuthTag after stream is done
            const authTag = encryptStream.getAuthTag();

            this.logger.log(`Backup complete. Rows: ${metadata.totalRows}. S3 Key: ${key}`);

            // 7. Update/Create Backup Record
            const backupData = {
                databaseId: database.id,
                status: 'Completed' as const, // Fix enum type issue
                s3Key: key,
                sizeBytes: 0, // TODO: Get actual size from stream/storage service
                schemaVersion: '1.0',
                totalRows: BigInt(metadata.totalRows),
                collectionCounts: metadata.collectionCounts || {},
                metadata: {
                    encryption: {
                        iv: iv.toString('hex'),
                        authTag: authTag.toString('hex')
                    },
                    schema: metadata.schema,
                    indexes: metadata.indexes
                },
                isEphemeral: isEphemeral || false,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                completedAt: new Date()
            };

            let finalBackupId = backupId;

            if (backupId) {
                await this.prisma.backup.update({
                    where: { id: backupId },
                    data: backupData
                });
            } else {
                const newBackup = await this.prisma.backup.create({
                    data: backupData
                });
                finalBackupId = newBackup.id;
            }

            // Notify User
            if (database) {
                await this.notificationOrchestrator.send(database.projectId, 'BACKUP_SUCCESS', {
                    databaseName: database.name,
                    sizeBytes: '0'
                });
            }

            // Check for Anomalies
            if (finalBackupId) {
                try {
                    await this.analysisService.checkAnomalies(finalBackupId);
                } catch (e) {
                    this.logger.error('Analysis failed', e);
                }
            }

            return {
                success: true,
                backupId: backupId,
                key
            };

        } catch (error: any) {
            this.logger.error(`Backup failed: ${error.message}`, error.stack);

            if (backupId) {
                await this.prisma.backup.update({
                    where: { id: backupId },
                    data: { status: 'Failed' }
                });
            }

            // Notify User (DB might be null if findUnique failed, handle gracefully)
            if (backupId) {
                const db = await this.prisma.database.findUnique({ where: { id: databaseId } });
                if (db) {
                    await this.notificationOrchestrator.send(db.projectId, 'BACKUP_FAILURE', {
                        databaseName: db.name,
                        error: error.message
                    });
                }
            }
            throw error;
        }
    }
}
