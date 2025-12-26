import { processSnapshotJob } from './processors/snapshot.processor.js';
import { QueueManager } from './queue-manager.js';
import { QueueNames, createLogger } from '@dbsnap/shared';

const logger = createLogger('worker');

const queueManager = new QueueManager();

async function main() {
  logger.info('Starting DBSnap Worker...');

  await queueManager.start({
    [QueueNames.BACKUP]: processSnapshotJob,
    [QueueNames.RESTORE]: async (job: any) => {
      logger.info(`Processing RESTORE job ${job.id}`);
      // TODO: Implement actual restore logic
    },
    [QueueNames.DIFF]: async (job: any) => {
      logger.info(`Processing DIFF job ${job.id}`);
      // TODO: Implement actual diff logic in ISSUE-052
    }
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    await queueManager.stop();
    process.exit(0);
  });
}

main().catch(err => {
  logger.error(`Worker failed to start: ${err.message}`);
  process.exit(1);
});
