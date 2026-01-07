import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class QuotasService {
    constructor(
        private prisma: PrismaService,
        private auditLogs: AuditLogsService
    ) { }

    async getQuota(userId: string) {
        const quota = await this.prisma.userQuota.findUnique({
            where: { userId }
        });

        if (!quota) {
            // Return default/empty quota if none exists
            return {
                userId,
                maxProjects: null,
                maxDatabases: null,
                maxStorageGB: null,
                retentionDays: null,
                ignorePlanLimits: false
            };
        }

        return quota;
    }

    async updateQuota(userId: string, data: any, adminId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Filter out fields that shouldn't be updated or are empty strings
        const cleanData: any = {};
        if (data.maxProjects !== undefined) cleanData.maxProjects = data.maxProjects === '' ? null : Number(data.maxProjects);
        if (data.maxDatabases !== undefined) cleanData.maxDatabases = data.maxDatabases === '' ? null : Number(data.maxDatabases);
        if (data.maxStorageGB !== undefined) cleanData.maxStorageGB = data.maxStorageGB === '' ? null : Number(data.maxStorageGB);
        if (data.retentionDays !== undefined) cleanData.retentionDays = data.retentionDays === '' ? null : Number(data.retentionDays);
        if (data.ignorePlanLimits !== undefined) cleanData.ignorePlanLimits = Boolean(data.ignorePlanLimits);

        const quota = await this.prisma.userQuota.upsert({
            where: { userId },
            create: {
                userId,
                ...cleanData
            },
            update: cleanData
        });

        await this.auditLogs.log({
            userId: adminId,
            action: 'ADMIN_UPDATE_QUOTA',
            resourceType: 'User',
            resourceId: userId,
            metadata: {
                targetUser: user.email,
                newQuota: cleanData
            }
        });

        return quota;
    }
}
