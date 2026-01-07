import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                projects: true,
                auditLogs: { take: 5, orderBy: { createdAt: 'desc' } }
            },
        });
    }

    async findAll(skip: number, take: number) {
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take,
                include: { role: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);

        return {
            data: users,
            meta: {
                total,
                skip,
                take,
            }
        };
    }

    async resetMfa(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                mfaEnabled: false,
                mfaSecret: null,
                backupCodes: [],
            },
        });
    }
}
