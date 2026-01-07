
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExportStatus } from '@prisma/client';

@Injectable()
export class ComplianceService {
    constructor(private prisma: PrismaService) { }

    async requestExport(userId: string, adminId?: string) {
        // For MVP, we will perform a synchronous gathering of data and store/return it.
        // In full prod, this starts a job.

        const exportRecord = await this.prisma.complianceExport.create({
            data: {
                userId,
                status: ExportStatus.PROCESSING,
            },
        });

        try {
            const data = await this.aggregateUserData(userId);
            // In real world, save 'data' to S3 and set s3Key.
            // For now, we might not save the huge JSON in DB. 
            // We will just mark it COMPLETED and maybe return the data if called directly,
            // or rely on a "download" endpoint. 
            // Let's assume for this Admin feature, we return the data immediately in the controller 
            // if it's a direct admin request, or we just utilize this record.

            await this.prisma.complianceExport.update({
                where: { id: exportRecord.id },
                data: { status: ExportStatus.COMPLETED }
            });

            if (adminId) {
                await this.prisma.auditLog.create({
                    data: {
                        userId: adminId,
                        action: 'GDPR_EXPORT_INITIATED',
                        resourceType: 'User',
                        resourceId: userId,
                    }
                });
            }

            return { ...exportRecord, status: ExportStatus.COMPLETED, data }; // Returning data for immediate use
        } catch (e) {
            await this.prisma.complianceExport.update({
                where: { id: exportRecord.id },
                data: { status: ExportStatus.FAILED }
            });
            throw e;
        }
    }

    async aggregateUserData(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                projects: {
                    include: {
                        databases: {
                            include: {
                                backups: true
                            }
                        },
                        notificationChannels: true
                    }
                },
                sessions: true,
                auditLogs: true,
                quota: true
            }
        });

        if (!user) throw new NotFoundException('User not found');

        // Sanitize
        const { passwordHash, mfaSecret, ...safeUser } = user;
        return {
            generatedAt: new Date(),
            user: safeUser
        };
    }

    async getExports(userId: string) {
        return this.prisma.complianceExport.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async deleteAccount(userId: string, adminId?: string) {
        // Verify user exists
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        if (user.isLegalHold) {
            throw new ForbiddenException('Account is under legal hold and cannot be deleted.');
        }

        await this.prisma.user.delete({
            where: { id: userId }
        });

        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: 'GDPR_DELETE_USER',
                    resourceType: 'User',
                    resourceId: userId,
                    metadata: { deletedEmail: user.email }
                }
            });
        }

        return { message: 'User permanently deleted' };
    }

    async toggleLegalHold(userId: string, isLegalHold: boolean, adminId?: string) {
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { isLegalHold },
        });

        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: 'LEGAL_HOLD_TOGGLE',
                    resourceType: 'User',
                    resourceId: userId,
                    metadata: { isLegalHold }
                }
            });
        }

        return updated;
    }
}
