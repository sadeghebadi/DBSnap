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
        const counts = await queue.getJobCounts('waiting', 'active', 'failed', 'delayed', 'completed');
        return counts;
    }

    async getGlobalQueueStats() {
        const [backup, restore, diff] = await Promise.all([
            this.getQueueStatus('backup'),
            this.getQueueStatus('restore'),
            this.getQueueStatus('diff'),
        ]);

        return {
            backup,
            restore,
            diff,
        };
    }

    async getActiveWorkers() {
        const redis = (this.backupQueue as any).client; // Access BullMQ's redis client
        const keys = await redis.keys('worker:stats:*');
        if (keys.length === 0) return [];

        const stats = await Promise.all(keys.map((key: string) => redis.get(key)));
        return stats.filter(s => s).map(s => JSON.parse(s));
    }

    async sendWorkerCommand(workerId: string, command: string) {
        const redis = (this.backupQueue as any).client;
        await redis.publish('worker:commands', JSON.stringify({
            targetId: workerId,
            command
        }));
        return { success: true };
    }

    async updateQueueConcurrency(queueName: string, concurrency: number) {
        const redis = (this.backupQueue as any).client;
        await redis.set(`queue:settings:${queueName}:concurrency`, concurrency);
        // Notify workers to reload settings
        await redis.publish('worker:commands', JSON.stringify({
            targetId: 'all',
            command: 'RELOAD_SETTINGS'
        }));
        return { success: true };
    }

    async getQueueSettings(queueName: string) {
        const redis = (this.backupQueue as any).client;
        const concurrency = await redis.get(`queue:settings:${queueName}:concurrency`);
        return {
            concurrency: concurrency ? parseInt(concurrency) : 5 // Default 5
        };
    }
}
