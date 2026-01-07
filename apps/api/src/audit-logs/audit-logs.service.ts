import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class AuditLogsService {
    constructor(
        private prisma: any,
        private encryptionService: EncryptionService
    ) { }

    async findAll(page: number, limit: number, filters?: { userId?: string; action?: string }) {
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters?.userId) where.userId = filters.userId;
        if (filters?.action) where.action = filters.action;

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data: logs.map((log: any) => ({
                ...log,
                metadata: this.decryptMetadata(log.metadata)
            })),
            meta: {
                total,
                page,
                limit,
            },
        };
    }

    private decryptMetadata(metadata: any) {
        if (!metadata) return null;

        // If it has the encryption structure, decrypt it
        if (metadata.iv && metadata.content && metadata.authTag) {
            try {
                const decrypted = this.encryptionService.decrypt(metadata as any);
                return JSON.parse(decrypted);
            } catch (error) {
                console.error('Failed to decrypt audit log metadata:', error);
                return metadata; // Fallback to raw if decryption fails
            }
        }

        // Return as is if it's already plain-text or unexpected format
        return metadata;
    }

    async log(data: {
        userId?: string;
        action: string;
        resourceType?: string;
        resourceId?: string;
        metadata?: any;
    }) {
        const metadata = data.metadata ? this.encryptionService.encrypt(JSON.stringify(data.metadata)) : null;

        return this.prisma.auditLog.create({
            data: {
                ...data,
                metadata: metadata as any
            },
        });
    }
}
