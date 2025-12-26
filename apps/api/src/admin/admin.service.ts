import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [totalUsers, totalBackups, successRate, totalStorage] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.backupSnapshot.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            }),
            this.getSuccessRate(),
            this.getTotalStorage()
        ]);

        return {
            totalUsers,
            totalBackupsLast24h: totalBackups,
            successRate,
            totalStorageBytes: totalStorage,
            growthMetrics: {
                usersThisWeek: 12, // Mocked for now
                growthPercent: 5.4
            }
        };
    }

    private async getSuccessRate() {
        const total = await this.prisma.backupSnapshot.count();
        if (total === 0) return 100;
        const success = await this.prisma.backupSnapshot.count({
            where: { status: 'COMPLETED' }
        });
        return (success / total) * 100;
    }

    private async getTotalStorage() {
        const result = await this.prisma.backupSnapshot.aggregate({
            _sum: {
                sizeBytes: true
            }
        });
        return Number(result._sum.sizeBytes || 0);
    }

    async listUsers(page: number = 1, limit: number = 10, search?: string) {
        const skip = (page - 1) * limit;
        const where = search ? {
            email: {
                contains: search,
                mode: 'insensitive' as const
            }
        } : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isVerified: true,
                    createdAt: true
                }
            }),
            this.prisma.user.count({ where })
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getRecentEvents() {
        // Mocking recent events for now. In a real scenario, this would come from an Audit Log or Events table.
        return [
            { id: 1, type: 'SECURITY', message: 'Unauthorized login attempt from 192.168.1.1', timestamp: new Date() },
            { id: 2, type: 'CRITICAL', message: 'Worker node 3 is unresponsive', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
            { id: 3, type: 'INFO', message: 'Maintenance mode toggled OFF by admin@dbsnap.com', timestamp: new Date(Date.now() - 30 * 60 * 1000) }
        ];
    }
}
