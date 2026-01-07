import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Get('recent')
    async getRecent(@Query('projectId') projectId: string) {
        if (!projectId) {
            // In a real app we'd extract from user context or require it
            throw new Error('Project ID required');
        }
        return this.jobsService.getRecentActivity(projectId);
    }
}
