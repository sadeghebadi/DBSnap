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
    async createUser(email: string, role: string, organizationId?: string) {
        return this.prisma.user.create({
            data: {
                email,
                passwordHash: 'temp-hash-invite-pending', // In a real app, logic to send invite email would go here
                role: role as any,
                isVerified: true,
                organizationId,
                isActive: true
            }
        });
    }

    async createOrganization(name: string, planId?: string) {
        return this.prisma.organization.create({
            data: {
                name,
                isActive: true
                // planId would be linked here if subscription logic was fully active
            }
        });
    }

    async impersonateUser(userId: string, adminId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        // Audit log would happen here
        this.logger.log(`Admin ${adminId} impersonating user ${userId}`);

        // Return a mock token for now. In production, this would sign a new JWT with a short expiration.
        return {
            impersonationToken: `mock_jwt_for_${user.email}`,
            user
        };
    }

    async resetMFA(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                mfaEnabled: false,
                mfaSecret: null,
                mfaRecoveryCodes: []
            }
        });
    }

    async suspendUser(userId: string, reason: string) {
        this.logger.warn(`Suspending user ${userId}. Reason: ${reason}`);
        // Invalidate sessions
        await this.prisma.session.updateMany({
            where: { userId },
            data: { isValid: false }
        });

        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false }
        });
    }

    async reactivateUser(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: true }
        });
    }

    async suspendOrg(orgId: string, reason: string) {
        this.logger.warn(`Suspending org ${orgId}. Reason: ${reason}`);
        // Pause all backup schedules for this org
        // This is a simplified logic; real logic would need to iterate projects -> connections -> schedules

        return this.prisma.organization.update({
            where: { id: orgId },
            data: { isActive: false }
        });
    }

    async reactivateOrg(orgId: string) {
        return this.prisma.organization.update({
            where: { id: orgId },
            data: { isActive: true }
        });
    }

    // ISSUE-088: Promo Codes
    async listPromoCodes() {
        return this.prisma.promoCode.findMany({
            orderBy: { createdAt: 'desc' },
            include: { plan: true }
        });
    }

    async createPromoCode(data: any) {
        return this.prisma.promoCode.create({
            data: {
                code: data.code,
                discountPercent: data.discountPercent ? parseInt(data.discountPercent) : null,
                discountAmount: data.discountAmount ? parseFloat(data.discountAmount) : null,
                usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
                expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
                planId: data.planId,
                isActive: true
            }
        });
    }

    async deactivatePromoCode(id: string) {
        return this.prisma.promoCode.update({
            where: { id },
            data: { isActive: false }
        });
    }

    // ISSUE-091: Quotas
    async updateOrgQuotas(orgId: string, data: any) {
        return this.prisma.organization.update({
            where: { id: orgId },
            data: {
                overrideMaxSnapshots: data.overrideMaxSnapshots,
                overrideMaxConnections: data.overrideMaxConnections,
                overrideStorageLimitGb: data.overrideStorageLimitGb,
                ignorePlanLimits: data.ignorePlanLimits
            }
        });
    }

    async listPlans() {
        return this.prisma.plan.findMany();
    }

    // ISSUE-084: Audit Logs
    async getAuditLogs(params: any) {
        return this.prisma.auditLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' }
        });
    }

    // ISSUE-092: Global Resource Browser
    async searchResources(query: string) {
        // Mock search implementation - ideally would search across models or use a view
        // For MVP, just returning empty arrays or mocking simple find
        return {
            databases: [],
            snapshots: []
        };
    }

    // ISSUE-090: Org Explorer
    async getOrgDetails(id: string) {
        return this.prisma.organization.findUnique({
            where: { id },
            include: {
                projects: { include: { connections: true } },
                users: true,
                subscription: true
            }
        });
    }

    // ISSUE-094: GDPR
    async gdprExport(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true }
        });
        return { user, exportedAt: new Date() };
    }

    async gdprDelete(userId: string) {
        // Check legal hold
        // const user = ... if (user.legalHold) throw Error
        // For now, simple delete placeholder
        return this.prisma.user.delete({ where: { id: userId } });
    }

    // ISSUE-095: Support Actions
    async triggerSupportAction(action: string, resourceId: string, adminId: string) {
        // Log action
        await this.prisma.auditLog.create({
            data: {
                adminId,
                action: `SUPPORT_${action}`,
                resource: resourceId,
                details: { triggeredByAdmin: true }
            }
        });
        return { success: true, message: `${action} triggered for ${resourceId}` };
    }
}
