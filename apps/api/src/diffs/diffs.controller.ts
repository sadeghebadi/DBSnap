import { Controller, Get, Param, Res, UseGuards, Request, Query, Post, Body } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DiffsService } from './diffs.service';

@Controller('diffs')
@UseGuards(JwtAuthGuard)
export class DiffsController {
    constructor(private readonly diffsService: DiffsService) { }

    @Get(':id')
    async getDiff(@Param('id') id: string, @Request() req: any) {
        return this.diffsService.getDiff(id, req.user.userId);
    }

    @Post('trigger')
    async triggerDiff(@Request() req: any, @Body() body: { snapshotAId: string, snapshotBId: string }) {
        return this.diffsService.triggerDiff(req.user.userId, body.snapshotAId, body.snapshotBId);
    }

    @Get(':id/download')
    async downloadDiff(@Param('id') id: string, @Request() req: any, @Res() res: Response) {
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Content-Disposition', `attachment; filename="diff-${id}.jsonl"`);
        return this.diffsService.getDiffDownloadStream(id, req.user.userId, res);
    }

    @Get(':id/lines')
    async getDiffLines(
        @Param('id') id: string,
        @Request() req: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.diffsService.getDiffLines(id, req.user.userId, page, limit);
    }
}
