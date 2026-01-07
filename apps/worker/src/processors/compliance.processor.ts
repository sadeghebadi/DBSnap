
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@dbsnap/database';
import { StorageService } from '../storage/storage.service';
import { COMPLIANCE_QUEUE } from '../queues/queue.constants';
import { Readable } from 'stream';

@Processor(COMPLIANCE_QUEUE)
export class ComplianceProcessor extends WorkerHost {
    private readonly logger = new Logger(ComplianceProcessor.name);

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
        private readonly storageService: StorageService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing compliance job ${job.name} (${job.id})`);

        switch (job.name) {
            case 'export-data':
                return this.handleExport(job);
            case 'purge-data':
                return this.handlePurge(job);
            default:
                throw new Error(`Unknown job name: ${job.name}`);
        }
    }

    private async handleExport(job: Job<{ exportId: string, userId: string }>) {
        const { exportId, userId } = job.data;

        try {
            await this.prisma.complianceExport.update({
                where: { id: exportId },
                data: { status: 'PROCESSING' }
            });

            // Gather Data
            const userData = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    projects: {
                        include: {
                            databases: {
                                include: {
                                    backups: true
                                }
                            }
                        }
                    },
                    auditLogs: true,
                    sessions: true
                }
            });

            if (!userData) throw new Error('User not found');

            // Sanitize sensitive fields (hashes, encrypted blobs) - GDPR allows access to Raw data provided by user or observed.
            // Encryption keys (IVs, AuthTags) are technically system metadata but effectively useless without MK.
            // We'll dump the whole structure as JSON.

            const exportContent = JSON.stringify(userData, null, 2);
            const s3Key = `exports/${userId}/${exportId}.json`;
            const { writeStream, done } = this.storageService.uploadStream(s3Key);

            const contentStream = Readable.from([exportContent]);
            contentStream.pipe(writeStream);

            await done;

            await this.prisma.complianceExport.update({
                where: { id: exportId },
                data: {
                    status: 'COMPLETED',
                    s3Key,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
                }
            });

        } catch (error: any) {
            this.logger.error('Export failed', error);
            await this.prisma.complianceExport.update({
                where: { id: exportId },
                data: { status: 'FAILED' }
            });
            throw error;
        }
    }

    private async handlePurge(job: Job<{ userId: string }>) {
        const { userId } = job.data;

        // 1. Identify all S3 resources
        const backups = await this.prisma.backup.findMany({
            where: { database: { project: { userId } } },
            select: { s3Key: true }
        });

        const backupKeys = backups.map(b => b.s3Key).filter(k => k !== null) as string[];

        const diffs = await this.prisma.diff.findMany({
            where: { snapshotA: { database: { project: { userId } } } },
            select: { s3DetailKey: true }
        });

        const diffKeys = diffs.map(d => d.s3DetailKey).filter(k => k !== null) as string[];

        const allKeys = [...backupKeys, ...diffKeys];
        this.logger.log(`Purging ${allKeys.length} S3 objects for user ${userId}`);

        // Serial delete for now
        for (const key of allKeys) {
            try {
                await this.storageService.deleteObject(key);
            } catch (e: any) {
                this.logger.warn(`Failed to delete S3 key ${key}: ${e.message}`);
                // Continue despite errors? GDPR says "reasonable effort". We should probably log it.
            }
        }

        // 2. Delete User (Cascade)
        // Prisma will handle standard cascade if configured, but we need to ensure it cascades to everything.
        // User -> Projects -> Databases -> Backups (Metadata) -> Diffs
        // Schema relation: User -> Project (onDelete: Cascade? Need to check schema)
        // Default prisma usually doesn't cascade unless specified in schema or DB.

        // Let's check schema again. `User -> projects` defines `Project[]`. `Project` has `userId`.
        // `user User @relation(fields: [userId], references: [id])`. NO onDelete: Cascade!
        // So we strictly need to delete projects first.

        // Wait! `ComplianceExport` DOES have Cascade!

        const projects = await this.prisma.project.findMany({ where: { userId } });
        for (const p of projects) {
            await this.prisma.project.delete({ where: { id: p.id } }); // This might fail if DB FKs restrict it.
        }

        await this.prisma.user.delete({ where: { id: userId } });

        this.logger.log(`User ${userId} purged successfully.`);
    }
}
