import { Worker, Job } from 'bullmq';
import { QueueNames, getRedisConnection, createLogger } from '@dbsnap/shared';
import { healthCheckServer } from './health-check.js';

const logger = createLogger('queue-manager');

export type JobProcessor = (job: Job) => Promise<any>;

export class QueueManager {
    private workers: Map<string, Worker> = new Map();

    async start(processors: Partial<Record<QueueNames, JobProcessor>>) {
        const connection = getRedisConnection();

        for (const [queueName, processor] of Object.entries(processors)) {
            const worker = new Worker(queueName, processor, {
                connection,
                concurrency: 5,
                removeOnComplete: { count: 100 },
                removeOnFail: { count: 1000 },
            });

            worker.on('completed', (job) => {
                logger.info(`Job ${job.id} in queue ${queueName} completed`);
                healthCheckServer.updatePulse();
            });

            worker.on('failed', (job, err) => {
                logger.error(`Job ${job?.id} in queue ${queueName} failed: ${err.message}`);
                healthCheckServer.updatePulse();
            });

            this.workers.set(queueName, worker);
            logger.info(`Started worker for queue: ${queueName}`);
        }

        healthCheckServer.setReady(true);
    }

    updateConcurrency(queueName: string, concurrency: number) {
        const worker = this.workers.get(queueName);
        if (worker) {
            worker.concurrency = concurrency;
            logger.info(`Updated concurrency for ${queueName} to ${concurrency}`);
        }
    }

    getManagedQueues(): string[] {
        return Array.from(this.workers.keys());
    }

    async stop() {
        healthCheckServer.setReady(false);
        for (const worker of this.workers.values()) {
            await worker.close();
        }
        this.workers.clear();
        logger.info('Stopped all workers');
    }
}
