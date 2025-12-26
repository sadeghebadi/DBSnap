import { Worker, Job } from 'bullmq';
import { QueueNames, getRedisConnection, createLogger } from '@dbsnap/shared';

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
            });

            worker.on('failed', (job, err) => {
                logger.error(`Job ${job?.id} in queue ${queueName} failed: ${err.message}`);
            });

            this.workers.set(queueName, worker);
            logger.info(`Started worker for queue: ${queueName}`);
        }
    }

    async stop() {
        for (const worker of this.workers.values()) {
            await worker.close();
        }
        this.workers.clear();
        logger.info('Stopped all workers');
    }
}
