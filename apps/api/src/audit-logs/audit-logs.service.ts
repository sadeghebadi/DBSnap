import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
    constructor(private prisma: any) { }

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
            data: logs,
            meta: {
                total,
                page,
                limit,
            },
        };
    }

    async log(data: {
        userId?: string;
        action: string;
        resourceType?: string;
        resourceId?: string;
        metadata?: any;
    }) {
        return this.prisma.auditLog.create({
            data,
        });
    }
}
