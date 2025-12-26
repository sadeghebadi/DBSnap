import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { StripeService } from './stripe.service.js';

@Injectable()
export class BillingService {
    constructor(
        private prisma: PrismaService,
        private stripe: StripeService
    ) { }

    async createCheckoutSession(userId: string, planId: string, successUrl: string, cancelUrl: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true }
        });

        if (!user || !user.organizationId) {
            throw new BadRequestException('User must belong to an organization');
        }

        const plan = await this.prisma.plan.findUnique({
            where: { id: planId }
        });

        if (!plan || !plan.stripePriceId) {
            throw new NotFoundException('Plan not found or not configured for billing');
        }

        return this.stripe.createCheckoutSession({
            customerEmail: user.email,
            priceId: plan.stripePriceId,
            successUrl,
            cancelUrl,
            metadata: {
                organizationId: user.organizationId,
                planId: plan.id
            }
        });
    }

    async getSubscription(organizationId: string) {
        return this.prisma.subscription.findUnique({
            where: { organizationId },
            include: { plan: true }
        });
    }

    async syncSubscription(data: {
        organizationId: string;
        planId: string;
        stripeSubscriptionId: string;
        status: string;
        currentPeriodEnd: Date;
    }) {
        return this.prisma.subscription.upsert({
            where: { organizationId: data.organizationId },
            update: {
                planId: data.planId,
                stripeSubscriptionId: data.stripeSubscriptionId,
                status: data.status,
                currentPeriodEnd: data.currentPeriodEnd,
            },
            create: {
                organizationId: data.organizationId,
                planId: data.planId,
                stripeSubscriptionId: data.stripeSubscriptionId,
                status: data.status,
                currentPeriodEnd: data.currentPeriodEnd,
            }
        });
    }

    async checkLimit(organizationId: string, limitKey: keyof {
        maxSnapshots: number;
        maxConnections: number;
        maxProjects: number;
        storageLimitGb: number;
    }, currentCount: number) {
        const sub = await this.getSubscription(organizationId);
        if (!sub) {
            // Default free tier limits or strict enforcement? 
            // For now, assume a default limit if no sub exists
            return currentCount < 5; // Simple default
        }

        const limit = sub.plan[limitKey] as number;
        return currentCount < limit;
    }
}
