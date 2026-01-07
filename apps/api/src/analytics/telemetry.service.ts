import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@dbsnap/database';

@Injectable()
export class TelemetryService {
    constructor(private prisma: PrismaClient) { }

    async getGlobalKPIs() {
        const [backupsLast24h, storageUsage, backupStatusCounts] = await Promise.all([
            this.getBackupsTrend(24),
            this.getStorageUsage(),
            this.getBackupStatusCounts(),
        ]);

        const totalBackups = backupStatusCounts.reduce((acc, curr) => acc + curr._count._all, 0);
        const successBackups = backupStatusCounts.find(c => c.status === 'Completed')?._count._all || 0;
        const failureRate = totalBackups > 0 ? ((totalBackups - successBackups) / totalBackups) * 100 : 0;

        return {
            backupsLast24h,
            totalStorageBytes: Number(storageUsage._sum.sizeBytes || 0),
            backupSuccessRate: 100 - failureRate,
            statusBreakdown: backupStatusCounts.map(c => ({
                status: c.status,
                count: c._count._all,
            })),
        };
    }

    private async getBackupsTrend(hours: number) {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.prisma.backup.count({
            where: {
                startedAt: { gte: since },
            },
        });
    }

    private async getStorageUsage() {
        return this.prisma.backup.aggregate({
            _sum: {
                sizeBytes: true,
            },
            where: {
                status: 'Completed',
            },
        });
    }

    private async getBackupStatusCounts() {
        return this.prisma.backup.groupBy({
            by: ['status'],
            _count: {
                _all: true,
            },
        });
    }
}
