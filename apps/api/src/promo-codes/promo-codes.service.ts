import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class PromoCodesService {
    constructor(private prisma: PrismaService) { }

    async createPromoCode(data: {
        code: string;
        discountPercent?: number;
        discountAmount?: number;
        expirationDate?: Date;
        usageLimit?: number;
        planId?: string;
    }) {
        const existing = await this.prisma.promoCode.findUnique({
            where: { code: data.code }
        });

        if (existing) {
            throw new BadRequestException('Promo code already exists');
        }

        return this.prisma.promoCode.create({
            data
        });
    }

    async listPromoCodes() {
        return this.prisma.promoCode.findMany({
            include: {
                plan: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async deactivatePromoCode(id: string) {
        return this.prisma.promoCode.update({
            where: { id },
            data: { isActive: false }
        });
    }

    async validatePromoCode(code: string, planId?: string) {
        const promo = await this.prisma.promoCode.findUnique({
            where: { code },
            include: { plan: true }
        });

        if (!promo || !promo.isActive) {
            throw new NotFoundException('Invalid or inactive promo code');
        }

        if (promo.expirationDate && promo.expirationDate < new Date()) {
            throw new BadRequestException('Promo code has expired');
        }

        if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
            throw new BadRequestException('Promo code usage limit reached');
        }

        if (promo.planId && planId && promo.planId !== planId) {
            throw new BadRequestException('Promo code not valid for this plan');
        }

        return promo;
    }

    async incrementUsage(id: string) {
        return this.prisma.promoCode.update({
            where: { id },
            data: {
                usageCount: {
                    increment: 1
                }
            }
        });
    }
}
