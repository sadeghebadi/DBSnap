import { Queue } from 'bullmq';
import { QueueNames, getRedisConnection, createLogger } from '@dbsnap/shared';
import { QueueManager } from './queue-manager.js';

const logger = createLogger('scaling-manager');

export class ScalingManager {
    private interval: NodeJS.Timeout | null = null;
    private queues: Map<string, Queue> = new Map();
    private currentConcurrency: Map<string, number> = new Map();

    constructor(private queueManager: QueueManager) { }

    async start() {
        const managedQueues = this.queueManager.getManagedQueues();
        for (const name of managedQueues) {
            this.queues.set(name, new Queue(name, { connection: getRedisConnection() }));
            this.currentConcurrency.set(name, 5); // Default base concurrency
        }

        this.interval = setInterval(() => this.checkLoad(), 30000);
        logger.info('Scaling manager started. Monitoring managed queues every 30s.');
    }

    async checkLoad() {
        try {
            for (const [name, queue] of this.queues.entries()) {
                const counts = await queue.getJobCounts('waiting', 'active');
                const totalLoad = counts.waiting + counts.active;
                let current = this.currentConcurrency.get(name) || 5;

                // Scaling UP: More than 10 jobs waiting
                if (counts.waiting > 10 && current < 20) {
                    const next = Math.min(current + 5, 20);
                    logger.warn(`[Scaling] High load detected on ${name} (${counts.waiting} waiting). Scaling UP: ${current} -> ${next}`);
                    this.queueManager.updateConcurrency(name, next);
                    this.currentConcurrency.set(name, next);
                }
                // Scaling DOWN: Zero load
                else if (totalLoad === 0 && current > 5) {
                    const next = Math.max(current - 2, 5);
                    logger.info(`[Scaling] No load detected on ${name}. Scaling DOWN: ${current} -> ${next}`);
                    this.queueManager.updateConcurrency(name, next);
                    this.currentConcurrency.set(name, next);
                }
            }
        } catch (err: any) {
            logger.error(`Error in scaling manager check: ${err.message}`);
        }
    }

    async stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        for (const queue of this.queues.values()) {
            await queue.close();
        }
        logger.info('Scaling manager stopped');
    }
}
