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



    @Post('users')
    async createUser(
        @Body('email') email: string,
        @Body('role') role: string,
        @Body('organizationId') organizationId?: string
    ) {
        return this.adminService.createUser(email, role, organizationId);
    }

    @Post('orgs')
    async createOrganization(
        @Body('name') name: string,
        @Body('planId') planId?: string
    ) {
        return this.adminService.createOrganization(name, planId);
    }

    // ISSUE-085: Impersonation
    @Post('users/:id/impersonate')
    async impersonateUser(@Param('id') userId: string, @Query('adminId') adminId: string) {
        return this.adminService.impersonateUser(userId, adminId);
    }

    // ISSUE-086: MFA Reset
    @Post('users/:id/mfa-reset')
    async resetMFA(@Param('id') userId: string) {
        return this.adminService.resetMFA(userId);
    }

    // ISSUE-093: Suspension
    @Post('users/:id/suspend')
    async suspendUser(@Param('id') userId: string, @Body('reason') reason: string) {
        return this.adminService.suspendUser(userId, reason);
    }

    @Post('users/:id/reactivate')
    async reactivateUser(@Param('id') userId: string) {
        return this.adminService.reactivateUser(userId);
    }

    @Post('orgs/:id/suspend')
    async suspendOrg(@Param('id') orgId: string, @Body('reason') reason: string) {
        return this.adminService.suspendOrg(orgId, reason);
    }

    @Post('orgs/:id/reactivate')
    async reactivateOrg(@Param('id') orgId: string) {
        return this.adminService.reactivateOrg(orgId);
    }

    // ISSUE-088: Promo Codes
    @Get('promo-codes')
    async listPromoCodes() {
        return this.adminService.listPromoCodes();
    }

    @Post('promo-codes')
    async createPromoCode(@Body() body: any) {
        return this.adminService.createPromoCode(body);
    }

    @Post('promo-codes/:id/deactivate')
    async deactivatePromoCode(@Param('id') id: string) {
        return this.adminService.deactivatePromoCode(id);
    }

    // ISSUE-091: Quotas
    @Post('orgs/:id/quotas')
    async updateOrgQuotas(@Param('id') orgId: string, @Body() body: any) {
        return this.adminService.updateOrgQuotas(orgId, body);
    }

    @Get('plans')
    async listPlans() {
        return this.adminService.listPlans();
    }

    // ISSUE-084 & Phase 4 Endpoints
    @Get('audit-logs')
    async getAuditLogs(@Query() query: any) {
        return this.adminService.getAuditLogs(query);
    }

    @Get('resources/search')
    async searchResources(@Query('q') q: string) {
        return this.adminService.searchResources(q);
    }

    @Get('orgs/:id/details')
    async getOrgDetails(@Param('id') id: string) {
        return this.adminService.getOrgDetails(id);
    }

    @Post('users/:id/gdpr/:action')
    async gdprAction(@Param('id') id: string, @Param('action') action: string) {
        if (action === 'export') return this.adminService.gdprExport(id);
        if (action === 'delete') return this.adminService.gdprDelete(id);
        throw new Error('Invalid GDPR action');
    }

    @Post('support/action')
    async supportAction(@Body() body: { action: string; resourceId: string; adminId: string }) {
        return this.adminService.triggerSupportAction(body.action, body.resourceId, body.adminId);
    }
}
