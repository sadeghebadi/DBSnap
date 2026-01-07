import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('overview')
    @Roles('ADMIN')
    async getOverview() {
        return this.analyticsService.getOverview();
    }

    @Get('usage')
    @Roles('ADMIN')
    async getUsage() {
        return this.analyticsService.getOrgUsageStats();
    }

    @Get('organizations/:id')
    @Roles('ADMIN')
    async getOrgDetails(@Param('id') id: string) {
        const details = await this.analyticsService.getUserResourceDetails(id);
        if (!details) throw new NotFoundException('User not found');
        return details;
    }
}
