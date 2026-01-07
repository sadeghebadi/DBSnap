import { Controller, Get, Param, Res, UseGuards, Post, Body } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BackupsService } from './backups.service';

@Controller('backups')
@UseGuards(JwtAuthGuard)
export class BackupsController {
    constructor(private readonly backupsService: BackupsService) { }

    @Get('project/:projectId')
    async getProjectBackups(@Param('projectId') projectId: string) {
        return this.backupsService.getProjectBackups(projectId);
    }

    @Post('trigger')
    async triggerBackup(@Body() body: { databaseId: string }) {
        return this.backupsService.triggerBackup(body.databaseId);
    }

    @Post(':id/restore')
    async triggerRestore(@Param('id') id: string) {
        return this.backupsService.triggerRestore(id);
    }

    @Get(':id/export')
    async export(@Param('id') id: string, @Res() res: Response) {
        return this.backupsService.exportBackup(id, res);
    }
}
