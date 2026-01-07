import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type JobActivity = {
    id: string;
    type: 'BACKUP' | 'DIFF';
    status: string;
    createdAt: Date;
    details: any;
    databaseName?: string;
};

@Injectable()
export class JobsService {
    constructor(
        private prisma: PrismaService
    ) { }

    async getRecentActivity(projectId: string, limit: number = 20): Promise<JobActivity[]> {
        // Fetch recent backups
        const backups = await this.prisma.backup.findMany({
            where: { database: { projectId } },
            orderBy: { startedAt: 'desc' },
            take: limit,
            include: { database: true }
        });

        // Fetch recent diffs
        const diffs = await this.prisma.diff.findMany({
            where: { snapshotA: { database: { projectId } } },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { snapshotA: { include: { database: true } } }
        });

        // Normalize and merge
        const activities: JobActivity[] = [];

        for (const b of backups as any) {
            activities.push({
                id: b.id,
                type: 'BACKUP',
                status: b.status,
                createdAt: b.startedAt,
                databaseName: b.database.name,
                details: {
                    sizeBytes: b.sizeBytes.toString(),
                    totalRows: b.totalRows?.toString() || '0'
                }
            });
        }

        for (const d of diffs as any) {
            activities.push({
                id: d.id,
                type: 'DIFF',
                status: d.status,
                createdAt: d.createdAt,
                databaseName: d.snapshotA.database.name,
                details: {
                    added: d.added,
                    removed: d.removed,
                    modified: d.modified
                }
            });
        }

        // Sort combined list desc
        return activities
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }
}
