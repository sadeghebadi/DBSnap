
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExportStatus } from '@prisma/client';

@Injectable()
export class ComplianceService {
    constructor(private prisma: PrismaService) { }

    async requestExport(userId: string) {
        // Check if there is already a pending export
        const pending = await this.prisma.complianceExport.findFirst({
            where: {
                userId,
                status: { in: [ExportStatus.PENDING, ExportStatus.PROCESSING] }
            }
        });

        if (pending) {
            return pending;
        }

        // Create new export record
        const exportRecord = await this.prisma.complianceExport.create({
            data: {
                userId,
                status: ExportStatus.PENDING,
            },
        });

        // TODO: Trigger BullMQ job to process the export
        // this.complianceQueue.add('process-export', { exportId: exportRecord.id });

        return exportRecord;
    }

    async getExports(userId: string) {
        return this.prisma.complianceExport.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async deleteAccount(userId: string) {
        // Verify user exists
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        if (user.isLegalHold) {
            throw new ForbiddenException('Account is under legal hold and cannot be deleted.');
        }

        // TODO: Trigger strict deletion job
        // Ideally we schedule this to happen after a grace period or immediately depending on policy.
        // For now, let's mark the user as suspended with a specific reason or just delete them?
        // The requirement says "Data Deletion".
        // Let's implement immediate deletion of resources for now, or just return success and stub the logic.

        // We will delete the user which cascades to many things, but we might need to cleanup S3 backups etc.
        // For this MVP step, I'll just delete the user record.
        return this.prisma.user.delete({
            where: { id: userId }
        });
    }

    async toggleLegalHold(userId: string, isLegalHold: boolean) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isLegalHold },
        });
    }
}
