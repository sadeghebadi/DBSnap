import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Get('status')
    async getStatus(@Request() req) {
        return this.billingService.getSubscriptionStatus(req.user.userId);
    }

    @Post('upgrade')
    async upgrade(@Request() req, @Body('plan') plan: 'FREE' | 'PRO' | 'TEAM') {
        return this.billingService.updatePlan(req.user.userId, plan);
    }
}
