import { Controller, Post, Get, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { DiffsService } from './diffs.service.js';

@Controller('diffs')
@UseGuards(JwtAuthGuard)
export class DiffsController {
    constructor(private readonly diffsService: DiffsService) { }

    @Post('trigger')
    async triggerDiff(
        @Request() req: any,
        @Body('snapshotAId') snapshotAId: string,
        @Body('snapshotBId') snapshotBId: string,
    ) {
        return this.diffsService.trigger(req.user.id, snapshotAId, snapshotBId);
    }

    @Get('results/:key(*)') // Use * to capture the full path key
    async getResult(
        @Request() req: any,
        @Param('key') key: string,
    ) {
        return this.diffsService.getResult(req.user.id, key);
    }
}
