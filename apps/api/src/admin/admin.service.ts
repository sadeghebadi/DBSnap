import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { Redis } from 'ioredis';
import { getConfig } from '@dbsnap/shared';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AdminService {
    private redis: Redis;
    private config = getConfig();
    private readonly logger = new Logger(AdminService.name);

    constructor(
        private prisma: PrismaService,
        @InjectQueue('backups') private backupsQueue: Queue
    ) {
        this.redis = new Redis(this.config.REDIS_URL, {
            maxRetriesPerRequest: null,
        });
    }

    async getStats() {
        const [totalUsers, totalBackups, successRate, totalStorage, jobCounts] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.backupSnapshot.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            }),
            this.getSuccessRate(),
            this.getTotalStorage(),
            this.backupsQueue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed', 'paused')
        ]);

        const workerStats = await this.getWorkerStats();

        return {
            totalUsers,
            totalBackupsLast24h: totalBackups,
            successRate,
            totalStorageBytes: totalStorage,
            queueDepth: jobCounts,
            workerStats,
            growthMetrics: {
                usersThisWeek: 12, // Mocked for now
                growthPercent: 5.4
            }
        };
    }

    private async getWorkerStats() {
        const keys = await this.redis.keys('dbsnap:worker:telemetry:*');
        const stats = [];
        for (const key of keys) {
            const data = await this.redis.get(key);
            if (data) {
                stats.push(JSON.parse(data));
            }
        }
        return stats;
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

    // ISSUE-057: DLQ Management
    async getFailedJobs() {
        const failed = await this.backupsQueue.getFailed();
        return failed.map(job => ({
            id: job.id,
            name: job.name,
            data: job.data,
            failedReason: job.failedReason,
            stacktrace: job.stacktrace,
            timestamp: job.timestamp,
        }));
    }

    async retryJob(jobId: string) {
        const job = await this.backupsQueue.getJob(jobId);
        if (job) {
            await job.retry();
            return { success: true };
        }
        return { success: false, message: 'Job not found' };
    }

    async retryAllFailed() {
        const failed = await this.backupsQueue.getFailed();
        await Promise.all(failed.map(job => job.retry()));
        return { count: failed.length };
    }

    async clearDLQ() {
        await this.backupsQueue.clean(0, 0, 'failed');
        return { success: true };
    }

    // ISSUE-087: Maintenance Mode
    async setMaintenanceMode(enabled: boolean, message?: string, whitelist?: string[]) {
        if (enabled) {
            await this.redis.set(this.config.MAINTENANCE_MODE_KEY, JSON.stringify({
                enabled,
                message: message || 'System is currently under maintenance. Please try again later.',
                whitelist: whitelist || [],
                updatedAt: new Date().toISOString(),
            }));
        } else {
            await this.redis.del(this.config.MAINTENANCE_MODE_KEY);
        }
        return { enabled };
    }

    async getMaintenanceStatus() {
        const status = await this.redis.get(this.config.MAINTENANCE_MODE_KEY);
        return status ? JSON.parse(status) : { enabled: false };
    }

    // ISSUE-089: Worker pool control
    async restartWorker(workerId: string) {
        // Send restart signal via Redis PubSub
        await this.redis.publish('dbsnap:worker:control', JSON.stringify({
            command: 'RESTART',
            workerId,
        }));
        return { success: true };
    }

    async updateConcurrency(concurrency: number) {
        await this.redis.publish('dbsnap:worker:control', JSON.stringify({
            command: 'UPDATE_CONCURRENCY',
            concurrency,
        }));
        return { success: true };
    }

    async getOrgUsageStats() {
        const orgs = await this.prisma.organization.findMany({
            include: {
                _count: {
                    select: {
                        projects: true,
                    }
                },
                projects: {
                    include: {
                        connections: {
                            include: {
                                _count: {
                                    select: {
                                        snapshots: true,
                                    }
                                },
                                snapshots: {
                                    select: {
                                        sizeBytes: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return orgs.map(org => {
            let totalSnapshots = 0;
            let totalStorageBytes = 0;
            let totalConnections = 0;

            org.projects.forEach(project => {
                totalConnections += project.connections.length;
                project.connections.forEach(conn => {
                    totalSnapshots += conn._count.snapshots;
                    conn.snapshots.forEach(snap => {
                        totalStorageBytes += Number(snap.sizeBytes || 0);
                    });
                });
            });

            return {
                id: org.id,
                name: org.name,
                projectCount: org._count.projects,
                connectionCount: totalConnections,
                snapshotCount: totalSnapshots,
                storageBytes: totalStorageBytes,
                createdAt: org.createdAt,
            };
        });
    }
}
