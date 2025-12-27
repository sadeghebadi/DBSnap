import { Body, Controller, Get, Param, Post, UseGuards, Req, Query, Delete, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';
import { ApiKeyGuard } from '../auth/guards/api-key.guard.js';
import { Scopes } from '../auth/decorators/scopes.decorator.js';
import { BackupsService } from './backups.service.js';
@Controller('backups')
export class BackupsController {
    constructor(
        @Inject(BackupsService) private readonly backupsService: BackupsService
    ) {
        console.log('BackupsController initialized, service:', !!this.backupsService);
    }

    @Post('trigger')
    @UseGuards(ApiKeyGuard)
    @Scopes('backup:run')
    trigger() {
        return {
            message: 'Backup triggered successfully via API key',
            timestamp: new Date().toISOString(),
        };
    }

    @Post('schedules')
    @UseGuards(ApiKeyGuard)
    @Scopes('backup:write')
    createSchedule(@Body() data: { name: string; cron: string; connectionId: string; retentionCount?: number; retentionDays?: number }) {
        return this.backupsService.createSchedule(data);
    }

    @Get('schedules')
    @UseGuards(ApiKeyGuard)
    @Scopes('backup:read')
    getSchedules() {
        return this.backupsService.getSchedules();
    }

    @Post('schedules/:id/trigger')
    @UseGuards(ApiKeyGuard)
    @Scopes('backup:run')
    triggerSchedule(@Param('id') id: string) {
        return this.backupsService.triggerBackup(id);
    }

    @Get('snapshots')
    @UseGuards(JwtAuthGuard, VerifiedGuard)
    async getSnapshots(@Req() req: { user: { userId: string } }) {
        return this.backupsService.findAllSnapshots(req.user.userId);
    }

    @Post('snapshots')
    @UseGuards(JwtAuthGuard, VerifiedGuard)
    async createSnapshot(@Req() req: { user: { userId: string } }, @Body() data: { connectionId: string }) {
        return this.backupsService.createManualSnapshot(req.user.userId, data.connectionId);
    }
    @Get('user/schedules')
    @UseGuards(JwtAuthGuard, VerifiedGuard)
    async getUserSchedules(@Req() req: { user: { userId: string } }, @Query('projectId') projectId?: string) {
        return this.backupsService.getSchedulesForUser(req.user.userId, projectId);
    }

    @Post('user/schedules')
    @UseGuards(JwtAuthGuard, VerifiedGuard)
    async createUserSchedule(@Req() req: { user: { userId: string } }, @Body() data: { name: string; cron: string; connectionId: string; retentionCount?: number; retentionDays?: number }) {
        return this.backupsService.createScheduleForUser(req.user.userId, data);
    }

    @Delete('user/schedules/:id')
    @UseGuards(JwtAuthGuard, VerifiedGuard)
    async deleteUserSchedule(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
        return this.backupsService.deleteScheduleForUser(req.user.userId, id);
    }
}
