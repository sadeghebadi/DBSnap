import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserPlan, DiscountType } from '@prisma/client';

@Injectable()
export class PromoCodesService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        code: string;
        discountType: DiscountType;
        discountValue: number;
        expiresAt?: Date;
        usageLimit?: number;
        eligiblePlans: UserPlan[];
    }) {
        const existing = await (this.prisma as any).promoCode.findUnique({
            where: { code: data.code },
        });
        if (existing) throw new BadRequestException('Promo code already exists');

        return (this.prisma as any).promoCode.create({ data });
    }

    async findAll() {
        return (this.prisma as any).promoCode.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async deactivate(id: string) {
        return (this.prisma as any).promoCode.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async validate(code: string, plan: UserPlan) {
        const promo = await (this.prisma as any).promoCode.findUnique({
            where: { code },
        });

        if (!promo || !promo.isActive) {
            throw new NotFoundException('Invalid or inactive promo code');
        }

        if (promo.expiresAt && new Date() > promo.expiresAt) {
            throw new BadRequestException('Promo code has expired');
        }

        if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
            throw new BadRequestException('Promo code usage limit reached');
        }

        if (!promo.eligiblePlans.includes(plan)) {
            throw new BadRequestException('Promo code is not eligible for this plan');
        }

        return promo;
    }

    async incrementUsage(id: string) {
        return (this.prisma as any).promoCode.update({
            where: { id },
            data: { usageCount: { increment: 1 } },
        });
    }
}
