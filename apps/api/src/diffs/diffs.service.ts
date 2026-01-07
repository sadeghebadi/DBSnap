import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient, DiffStatus } from '@dbsnap/database';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { EncryptionService } from '../encryption/encryption.service';
import { Readable } from 'stream';
import { Response } from 'express';
import split2 from 'split2';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DIFF_QUEUE } from '../queues/queue.constants';

@Injectable()
export class DiffsService {
    private s3: S3Client;
    private bucketName: string;

    constructor(
        private prisma: PrismaClient,
        private encryptionService: EncryptionService,
        @InjectQueue(DIFF_QUEUE) private diffQueue: Queue,
    ) {
        this.s3 = new S3Client({
            region: process.env.S3_REGION || 'us-east-1',
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY || '',
                secretAccessKey: process.env.S3_SECRET_KEY || '',
            },
            forcePathStyle: true,
        });
        this.bucketName = process.env.S3_BUCKET_NAME || 'dbsnap-backups';
    }

    async triggerDiff(userId: string, snapshotAId: string, snapshotBId: string) {
        // Validation: Verify existence and ownership
        const snapshotA = await this.prisma.backup.findUnique({ where: { id: snapshotAId }, include: { database: { include: { project: true } } } });
        const snapshotB = await this.prisma.backup.findUnique({ where: { id: snapshotBId }, include: { database: { include: { project: true } } } });

        if (!snapshotA || !snapshotB) throw new NotFoundException('One or both snapshots not found');
        if (snapshotA.database.project.userId !== userId) throw new ForbiddenException('Access denied');
        if (snapshotB.database.project.userId !== userId) throw new ForbiddenException('Access denied');

        // Create Pending Diff Record
        const diff = await this.prisma.diff.create({
            data: {
                snapshotAId,
                snapshotBId,
                status: DiffStatus.Pending,
            }
        });

        // Add to Queue
        await this.diffQueue.add('diff-job', {
            diffId: diff.id,
            snapshotAId,
            snapshotBId
        });

        return { success: true, diffId: diff.id, message: 'Diff calculation triggered' };
    }

    async getDiff(diffId: string, userId: string) {
        const diff = await this.prisma.diff.findUnique({
            where: { id: diffId },
            include: {
                snapshotA: { include: { database: { include: { project: true } } } },
                snapshotB: { include: { database: { include: { project: true } } } },
            },
        });

        if (!diff) {
            throw new NotFoundException('Diff not found');
        }

        // Check ownership (via snapshotA)
        if (diff.snapshotA.database.project.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return diff;
    }

    async getDiffDownloadStream(diffId: string, userId: string, res: Response) {
        const diff = await this.getDiff(diffId, userId);

        if (!diff.s3DetailKey) {
            throw new NotFoundException('No detail file available for this diff');
        }

        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: diff.s3DetailKey,
        });

        try {
            const result = await this.s3.send(command);
            const stream = result.Body as Readable;

            stream.pipe(res);
        } catch (e) {
            console.error(e);
            throw new InternalServerErrorException('Failed to download diff stream');
        }
    }

    async getDiffLines(diffId: string, userId: string, page: number = 1, limit: number = 50) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 50;
        if (limit > 1000) limit = 1000; // Hard limit

        const diff = await this.getDiff(diffId, userId);

        if (!diff.s3DetailKey) {
            return {
                data: [],
                meta: { page, limit, totalLines: 0 } // Total lines unknown without scan or metadata
            };
        }

        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: diff.s3DetailKey,
        });

        const lines: any[] = [];
        let lineCount = 0;
        const startLine = (page - 1) * limit;
        const endLine = startLine + limit;

        try {
            const result = await this.s3.send(command);
            const stream = result.Body as Readable;

            await new Promise<void>((resolve, reject) => {
                stream
                    .pipe(split2(JSON.parse))
                    .on('data', (line: any) => {
                        if (lineCount >= startLine && lineCount < endLine) {
                            lines.push(line);
                        }
                        lineCount++;
                        if (lineCount >= endLine) {
                            stream.destroy(); // Stop reading
                            resolve();
                        }
                    })
                    .on('end', () => resolve())
                    .on('error', (err: any) => reject(err));
            });

            return {
                data: lines,
                meta: {
                    page,
                    limit,
                    hasMore: lineCount >= endLine // Approximate
                }
            };

        } catch (e) {
            console.error(e);
            throw new InternalServerErrorException('Failed to fetch diff lines');
        }
    }
}
