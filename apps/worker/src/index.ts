import { processSnapshotJob } from './processors/snapshot.processor.js';
import { processDiffJob } from './processors/diff.processor.js';
import { processThresholdJob } from './processors/threshold.processor.js';
import { QueueManager } from './queue-manager.js';
import { QueueNames, createLogger } from '@dbsnap/shared';
import { healthCheckServer } from './health-check.js';
import { ScalingManager } from './scaling-manager.js';

const logger = createLogger('worker');

const queueManager = new QueueManager();
const scalingManager = new ScalingManager(queueManager);

async function main() {
  logger.info('Starting DBSnap Worker...');

  healthCheckServer.start();

  await queueManager.start({
    [QueueNames.BACKUP]: processSnapshotJob,
    [QueueNames.RESTORE]: async (job: any) => {
      logger.info(`Processing RESTORE job ${job.id}`);
      // TODO: Implement actual restore logic
    },
    [QueueNames.DIFF]: processDiffJob,
    [QueueNames.THRESHOLD_CHECK]: processThresholdJob,
  });

  // Start Scaling Manager after workers are initialized
  await scalingManager.start();

  process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    await queueManager.stop();
    await scalingManager.stop();
    healthCheckServer.stop();
    process.exit(0);
  });
}

main().catch(err => {
  logger.error(`Worker failed to start: ${err.message}`);
  process.exit(1);
});
