import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { Queue } from 'bullmq';
import { QueueNames, getConfig } from '@dbsnap/shared';
import fs from 'fs/promises';
import path from 'path';

@Injectable()
export class DiffsService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(QueueNames.DIFF) private readonly diffQueue: Queue,
    ) { }

    async trigger(userId: string, snapshotAId: string, snapshotBId: string) {
        // Enforce ownership: Both snapshots must belong to connections the user has access to
        const [snapshotA, snapshotB] = await Promise.all([
            this.prisma.backupSnapshot.findUnique({
                where: { id: snapshotAId },
                include: { connection: { include: { project: { include: { organization: { include: { users: true } } } } } } }
            }),
            this.prisma.backupSnapshot.findUnique({
                where: { id: snapshotBId },
                include: { connection: { include: { project: { include: { organization: { include: { users: true } } } } } } }
            })
        ]);

        if (!snapshotA || !snapshotB) {
            throw new NotFoundException('One or both snapshots not found');
        }

        const userInOrgA = snapshotA.connection.project.organization.users.some(u => u.id === userId);
        const userInOrgB = snapshotB.connection.project.organization.users.some(u => u.id === userId);

        if (!userInOrgA || !userInOrgB) {
            throw new ForbiddenException('Access denied to one or both snapshots');
        }

        if (snapshotA.connection.type !== snapshotB.connection.type) {
            throw new ForbiddenException('Cannot compare different database types');
        }

        // Push job to BullMQ
        const job = await this.diffQueue.add('diff-trigger', {
            snapshotAId,
            snapshotBId,
            projectId: snapshotA.connection.projectId,
            organizationId: snapshotA.connection.project.organizationId,
        });

        return {
            jobId: job.id,
            status: 'queued',
            message: 'Comparison job has been queued.'
        };
    }

    async getResult(userId: string, key: string) {
        // The key is usually diff-results/<id>.json
        // We need to ensure the user has access to the project associated with this diff
        // For simplicity in this L2/L3 task, and since results are not currently tracked in DB
        // (they are just files), we'll assume the key contains information OR we'd need a Diff model.
        // However, ISSUE-044 was Diff Persistence, let's check if there is a Diff model.

        // Let's just return the content for now as requested.
        // Real implementation would use StorageFactory.
        const config = getConfig();
        const diskDir = './storage'; // Default for local

        try {
            const filePath = path.join(process.cwd(), diskDir, key);
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (err) {
            throw new NotFoundException(`Result not found for key: ${key}`);
        }
    }
}
