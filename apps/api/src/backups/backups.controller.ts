import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key.guard.js';
import { Scopes } from '../auth/decorators/scopes.decorator.js';
import { BackupsService } from './backups.service.js';

@Controller('backups')
export class BackupsController {
    constructor(private readonly backupsService: BackupsService) { }

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
    createSchedule(@Body() data: any) {
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
}
