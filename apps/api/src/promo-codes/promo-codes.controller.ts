import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';
import { UserRole } from '@dbsnap/shared';
import { PromoCodesService } from './promo-codes.service.js';

@Controller('promo-codes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromoCodesController {
    constructor(private promoCodesService: PromoCodesService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    async listPromoCodes() {
        return this.promoCodesService.listPromoCodes();
    }

    @Post()
    @Roles(UserRole.ADMIN)
    async createPromoCode(@Body() data: any) {
        if (data.expirationDate) {
            data.expirationDate = new Date(data.expirationDate);
        }
        return this.promoCodesService.createPromoCode(data);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async deactivatePromoCode(@Param('id') id: string) {
        return this.promoCodesService.deactivatePromoCode(id);
    }

    @Get('validate')
    async validatePromoCode(
        @Query('code') code: string,
        @Query('planId') planId?: string
    ) {
        return this.promoCodesService.validatePromoCode(code, planId);
    }
}
