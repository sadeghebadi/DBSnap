import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) { }

    async createSession(userId: string, ipAddress?: string, userAgent?: string) {
        const session = await this.prisma.session.create({
            data: {
                userId,
                ipAddress,
                userAgent,
            },
        });
        return session.id;
    }

    async invalidateSession(sessionId: string) {
        try {
            await this.prisma.session.delete({
                where: { id: sessionId },
            });
        } catch (e) {
            // Ignore if already deleted
        }
    }

    async invalidateAllUserSessions(userId: string) {
        await this.prisma.session.deleteMany({
            where: { userId },
        });
    }

    async getActiveSessions(userId: string) {
        return this.prisma.session.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async validateSession(sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        return !!session;
    }
}
