import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueNames } from '@dbsnap/shared';

@Injectable()
export class JobsService {
    constructor(
        @Inject(QueueNames.BACKUP) private readonly backupQueue: Queue,
        @Inject(QueueNames.RESTORE) private readonly restoreQueue: Queue,
        @Inject(QueueNames.DIFF) private readonly diffQueue: Queue,
    ) { }

    private getQueue(queueName: string): Queue {
        switch (queueName) {
            case QueueNames.BACKUP:
                return this.backupQueue;
            case QueueNames.RESTORE:
                return this.restoreQueue;
            case QueueNames.DIFF:
                return this.diffQueue;
            default:
                throw new NotFoundException(`Queue ${queueName} not found`);
        }
    }

    async getJobStatus(queueName: string, jobId: string) {
        const queue = this.getQueue(queueName);
        const job = await queue.getJob(jobId);

        if (!job) {
            throw new NotFoundException(`Job ${jobId} not found in queue ${queueName}`);
        }

        const state = await job.getState();

        return {
            id: job.id,
            name: job.name,
            state, // 'waiting', 'active', 'completed', 'failed', 'delayed', 'paused'
            progress: job.progress,
            data: job.data,
            returnvalue: job.returnvalue,
            stacktrace: job.stacktrace,
            timestamp: job.timestamp,
            finishedOn: job.finishedOn,
        };
    }
}
