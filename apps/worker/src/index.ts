import { QueueManager } from './queue-manager.js';
import { QueueNames, logger } from '@dbsnap/shared';

const queueManager = new QueueManager();

async function main() {
  logger.info('Starting DBSnap Worker...');

  await queueManager.start({
    [QueueNames.BACKUP]: async (job) => {
      logger.info(`Processing BACKUP job ${job.id}`);
      // TODO: Implement actual backup logic in ISSUE-051
    },
    [QueueNames.RESTORE]: async (job) => {
      logger.info(`Processing RESTORE job ${job.id}`);
      // TODO: Implement actual restore logic
    },
    [QueueNames.DIFF]: async (job) => {
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
