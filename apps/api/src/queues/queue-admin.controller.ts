import { Controller, Get, Post, Delete, Param, UseGuards, Body } from '@nestjs/common';
import { QueueAdminService } from './queue-admin.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming we want protection

@Controller('queues')
export class QueueAdminController {
    constructor(private readonly queueAdminService: QueueAdminService) { }

    @Get(':name/failed')
    async getFailedJobs(@Param('name') name: string) {
        return this.queueAdminService.getFailedJobs(name);
    }

    @Post(':name/jobs/:id/retry')
    async retryJob(@Param('name') name: string, @Param('id') id: string) {
        return this.queueAdminService.retryJob(name, id);
    }

    @Delete(':name/failed')
    async cleanQueue(@Param('name') name: string) {
        return this.queueAdminService.cleanQueue(name);
    }

    @Get('workers')
    async getWorkers() {
        return this.queueAdminService.getActiveWorkers();
    }

    @Post('workers/:id/restart')
    async restartWorker(@Param('id') id: string) {
        return this.queueAdminService.sendWorkerCommand(id, 'RESTART');
    }

    @Get(':name/settings')
    async getSettings(@Param('name') name: string) {
        return this.queueAdminService.getQueueSettings(name);
    }

    @Post(':name/concurrency')
    async updateConcurrency(@Param('name') name: string, @Body('concurrency') concurrency: number) {
        return this.queueAdminService.updateQueueConcurrency(name, concurrency);
    }
}
