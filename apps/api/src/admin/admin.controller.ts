import { Controller, Get, Post, Body, Delete, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';
import { UserRole } from '@dbsnap/shared';
import { AdminService } from './admin.service.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, VerifiedGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('users')
    async listUsers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string
    ) {
        return this.adminService.listUsers(parseInt(page), parseInt(limit), search);
    }

    @Get('events')
    async getRecentEvents() {
        return this.adminService.getRecentEvents();
    }

    // ISSUE-057: DLQ Management
    @Get('dlq')
    async getFailedJobs() {
        return this.adminService.getFailedJobs();
    }

    @Post('dlq/:id/retry')
    async retryJob(@Param('id') id: string) {
        return this.adminService.retryJob(id);
    }

    @Post('dlq/retry-all')
    async retryAllFailed() {
        return this.adminService.retryAllFailed();
    }

    @Delete('dlq')
    async clearDLQ() {
        return this.adminService.clearDLQ();
    }

    // ISSUE-087: Maintenance Mode
    @Get('maintenance')
    async getMaintenanceStatus() {
        return this.adminService.getMaintenanceStatus();
    }

    @Post('maintenance')
    async setMaintenanceMode(
        @Body('enabled') enabled: boolean,
        @Body('message') message?: string,
        @Body('whitelist') whitelist?: string[]
    ) {
        return this.adminService.setMaintenanceMode(enabled, message, whitelist);
    }

    // ISSUE-089: Worker Pool Control
    @Post('workers/:id/restart')
    async restartWorker(@Param('id') id: string) {
        return this.adminService.restartWorker(id);
    }

    @Patch('workers/concurrency')
    async updateConcurrency(@Body('concurrency') concurrency: number) {
        return this.adminService.updateConcurrency(concurrency);
    }

    @Get('usage-stats')
    async getOrgUsageStats() {
        return this.adminService.getOrgUsageStats();
    }
}
