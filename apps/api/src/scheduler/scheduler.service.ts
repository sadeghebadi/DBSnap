
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(@InjectQueue('backup-queue') private backupQueue: Queue) { }

    async scheduleBackup(projectId: string, cron: string) {
        this.logger.log(`Scheduling backup for project ${projectId} with cron ${cron}`);
        await this.backupQueue.add(
            'perform-backup',
            { projectId },
            {
                repeat: {
                    pattern: cron,
                },
                jobId: `backup-${projectId}`, // Ensure uniqueness to avoid duplicates
            },
        );
    }

    async unscheduleBackup(projectId: string, cron: string) {
        this.logger.log(`Unscheduling backup for project ${projectId}`);
        // Removing repeatable jobs in BullMQ requires knowing the key or config.
        // For MVP, we pass the same pattern to remove it.
        await this.backupQueue.removeRepeatable(
            'perform-backup',
            { pattern: cron, jobId: `backup-${projectId}` }
        );
    }
}
