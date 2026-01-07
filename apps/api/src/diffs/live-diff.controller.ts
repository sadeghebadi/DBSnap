import { Controller, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LiveDiffService } from './live-diff.service';

@Controller('databases')
@UseGuards(JwtAuthGuard)
export class LiveDiffController {
    constructor(private readonly liveDiffService: LiveDiffService) { }

    @Post(':id/diff/live')
    async triggerLiveDiff(
        @Param('id') databaseId: string,
        @Body('baseSnapshotId') baseSnapshotId: string,
        @Request() req: any
    ) {
        return this.liveDiffService.triggerLiveDiff(databaseId, baseSnapshotId, req.user.userId);
    }
}
