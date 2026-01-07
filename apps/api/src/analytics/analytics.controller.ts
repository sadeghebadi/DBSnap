import { Controller, Get, Param, UseGuards, NotFoundException, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { TelemetryService } from './telemetry.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly telemetryService: TelemetryService
    ) { }

    @Get('telemetry')
    @Roles('ADMIN')
    async getTelemetry() {
        return this.telemetryService.getGlobalKPIs();
    }

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

    @Get('admin/databases')
    @Roles('ADMIN')
    async getGlobalDatabases(
        @Query('q') q?: string,
        @Query('type') type?: string
    ) {
        return this.analyticsService.getGlobalDatabases(q, type);
    }

    @Get('admin/snapshots')
    @Roles('ADMIN')
    async getGlobalSnapshots(
        @Query('q') q?: string,
        @Query('status') status?: string
    ) {
        return this.analyticsService.getGlobalSnapshots(q, status);
    }
}
