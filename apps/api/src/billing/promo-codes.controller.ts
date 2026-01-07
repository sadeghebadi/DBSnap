import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserPlan, DiscountType } from '@prisma/client';

@Controller('billing/promo-codes')
export class PromoCodesController {
    constructor(private readonly promoCodesService: PromoCodesService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async findAll() {
        return this.promoCodesService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async create(@Body() data: {
        code: string;
        discountType: DiscountType;
        discountValue: number;
        expiresAt?: string;
        usageLimit?: number;
        eligiblePlans: UserPlan[];
    }) {
        return this.promoCodesService.create({
            ...data,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        });
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async deactivate(@Param('id') id: string) {
        return this.promoCodesService.deactivate(id);
    }

    @Post('validate')
    async validate(@Body() data: { code: string; plan: UserPlan }) {
        return this.promoCodesService.validate(data.code, data.plan);
    }
}
