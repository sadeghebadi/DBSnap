import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BACKUP_QUEUE, RESTORE_QUEUE, DIFF_QUEUE } from './queue.constants';

@Injectable()
export class QueueAdminService {
    constructor(
        @InjectQueue(BACKUP_QUEUE) private backupQueue: Queue,
        @InjectQueue(RESTORE_QUEUE) private restoreQueue: Queue,
        @InjectQueue(DIFF_QUEUE) private diffQueue: Queue,
    ) { }

    private getQueue(name: string): Queue {
        switch (name) {
            case 'backup': return this.backupQueue;
            case 'restore': return this.restoreQueue;
            case 'diff': return this.diffQueue;
            case BACKUP_QUEUE: return this.backupQueue;
            case RESTORE_QUEUE: return this.restoreQueue;
            case DIFF_QUEUE: return this.diffQueue;
            default:
                throw new NotFoundException(`Queue ${name} not found`);
        }
    }

    async getFailedJobs(queueName: string) {
        const queue = this.getQueue(queueName);
        const jobs = await queue.getJobs(['failed']);
        return jobs.map(job => ({
            id: job.id,
            name: job.name,
            failedReason: job.failedReason,
            stacktrace: job.stacktrace,
            data: job.data,
            timestamp: job.timestamp,
            finishedOn: job.finishedOn
        }));
    }

    async retryJob(queueName: string, jobId: string) {
        const queue = this.getQueue(queueName);
        const job = await queue.getJob(jobId);
        if (!job) {
            throw new NotFoundException(`Job ${jobId} not found in ${queueName}`);
        }
        await job.retry();
        return { success: true, message: `Job ${jobId} retried` };
    }

    async cleanQueue(queueName: string) {
        const queue = this.getQueue(queueName);
        // Clean failed jobs. 0 means "remove all that failed > 0ms ago" (all of them)
        // limit (number) - Max number of jobs to clean. Default: 0 (unlimited) seems wrong in docs sometimes, 
        // typically queue.clean(grace, limit, type).
        // BullMQ v5 usually: clean(grace, limit, type)
        // Actually: clean(grace, limit, type) 
        // grace: time in ms.
        // limit: max jobs to clean.

        await queue.clean(0, 0, 'failed');
        return { success: true, message: `Cleaned failed jobs in ${queueName}` };
    }

    async getQueueStatus(queueName: string) {
        const queue = this.getQueue(queueName);
        const counts = await queue.getJobCounts('waiting', 'active', 'failed', 'delayed');
        return counts;
    }
}
