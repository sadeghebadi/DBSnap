
import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { COMPLIANCE_QUEUE } from '../queues/queue.constants';

@Injectable()
export class ComplianceService {
    private readonly logger = new Logger(ComplianceService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLogsService: AuditLogsService,
        @InjectQueue(COMPLIANCE_QUEUE) private complianceQueue: Queue,
    ) { }

    async triggerExport(userId: string, requestedBy: string) {
        this.logger.log(`Triggering compliance export for user ${userId} by ${requestedBy}`);

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Create Export Record
        const exportRecord = await this.prisma.complianceExport.create({
            data: {
                userId,
                status: 'PENDING',
            }
        });

        // Add to Queue
        await this.complianceQueue.add('export-data', {
            exportId: exportRecord.id,
            userId,
            requestedBy
        });

        await this.auditLogsService.log({
            userId: requestedBy,
            action: 'COMPLIANCE_EXPORT_TRIGGERED',
            resourceType: 'User',
            resourceId: userId,
            metadata: { exportId: exportRecord.id }
        });

        return exportRecord;
    }

    async deleteUser(userId: string, requestedBy: string) {
        this.logger.log(`Requesting permanent deletion for user ${userId} by ${requestedBy}`);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { projects: true }
        });

        if (!user) throw new NotFoundException('User not found');

        // Check Legal Hold
        if (user.isLegalHold) {
            throw new ForbiddenException(`User ${userId} is under Legal Hold. Deletion prevented.`);
        }

        // Check Project Legal Holds
        const heldProjects = user.projects.filter(p => p.isLegalHold);
        if (heldProjects.length > 0) {
            throw new ForbiddenException(`User has projects under Legal Hold: ${heldProjects.map(p => p.name).join(', ')}`);
        }

        // Add to Queue for Purge
        await this.complianceQueue.add('purge-data', {
            userId,
            requestedBy
        });

        await this.auditLogsService.log({
            userId: requestedBy,
            action: 'COMPLIANCE_DELETE_REQUESTED',
            resourceType: 'User',
            resourceId: userId,
        });

        return { message: 'Deletion scheduled', status: 'PROCESSING' };
    }

    async toggleLegalHold(userId: string, isHeld: boolean, requestedBy: string, reason?: string) {
        this.logger.log(`Toggling Legal Hold for user ${userId} to ${isHeld} by ${requestedBy}`);

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isLegalHold: isHeld }
        });

        await this.auditLogsService.log({
            userId: requestedBy,
            action: isHeld ? 'LEGAL_HOLD_APPLIED' : 'LEGAL_HOLD_REMOVED',
            resourceType: 'User',
            resourceId: userId,
            metadata: { reason }
        });

        return user;
    }

    async getExports(userId: string) {
        return this.prisma.complianceExport.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
