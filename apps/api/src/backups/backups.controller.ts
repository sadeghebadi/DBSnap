import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BackupsService } from './backups.service';

@Controller('backups')
@UseGuards(JwtAuthGuard)
export class BackupsController {
    constructor(private readonly backupsService: BackupsService) { }

    @Get(':id/export')
    async export(@Param('id') id: string, @Res() res: Response) {
        return this.backupsService.exportBackup(id, res);
    }
}
