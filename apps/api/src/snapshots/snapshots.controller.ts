import { Controller, Get, Post, Param, UseGuards, Req, Query } from '@nestjs/common';
import { SnapshotsService } from './snapshots.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';

@Controller('snapshots')
@UseGuards(JwtAuthGuard, VerifiedGuard)
export class SnapshotsController {
    constructor(private readonly snapshotsService: SnapshotsService) { }

    @Get()
    async findAll(
        @Req() req: { user: { userId: string } },
        @Query('projectId') projectId: string
    ) {
        return this.snapshotsService.findAll(req.user.userId, projectId);
    }

    @Get(':id')
    async findOne(
        @Req() req: { user: { userId: string } },
        @Param('id') id: string
    ) {
        return this.snapshotsService.findOne(req.user.userId, id);
    }

    @Post()
    async trigger(
        @Req() req: { user: { userId: string } },
        @Query('projectId') projectId: string
    ) {
        return this.snapshotsService.trigger(req.user.userId, projectId);
    }
}
