import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';

@Controller('jobs')
@UseGuards(JwtAuthGuard, VerifiedGuard)
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Get(':queueName/:jobId')
    async getJobStatus(
        @Param('queueName') queueName: string,
        @Param('jobId') jobId: string
    ) {
        return this.jobsService.getJobStatus(queueName, jobId);
    }
}
