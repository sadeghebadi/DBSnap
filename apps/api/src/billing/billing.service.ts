import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    async getSubscriptionStatus(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                plan: true,
                projects: {
                    include: {
                        databases: true,
                    },
                },
            },
        });

        if (!user) throw new Error('User not found');

        const totalProjects = user.projects.length;
        const totalDatabases = user.projects.reduce((sum, p) => sum + p.databases.length, 0);

        // Mock limits for MVP
        const limits = {
            FREE: { projects: 1, databases: 1 },
            PRO: { projects: 5, databases: 10 },
            TEAM: { projects: 20, databases: 50 },
        };

        const currentLimits = limits[user.plan] || limits.FREE;

        return {
            plan: user.plan,
            usage: {
                projects: totalProjects,
                databases: totalDatabases,
            },
            limits: currentLimits,
            isOverLimit: totalProjects >= currentLimits.projects || totalDatabases >= currentLimits.databases,
        };
    }

    async updatePlan(userId: string, plan: 'FREE' | 'PRO' | 'TEAM') {
        return this.prisma.user.update({
            where: { id: userId },
            data: { plan },
        });
    }
}
