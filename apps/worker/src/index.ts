import { getConfig, createLogger, runWithContext } from "@dbsnap/shared";
import { randomUUID } from 'crypto';
import { WorkerTelemetry } from './telemetry.js';
import { SnapshotEngine, DatabaseType } from './snapshots/snapshot-engine.js';
import { StorageFactory } from './storage/storage.factory.js';

const config = getConfig();
const logger = createLogger('worker');

const snapshotEngine = new SnapshotEngine();
const storageAdapter = StorageFactory.createAdapter({
  driver: 'local', // In a real app, this would come from config.STORAGE_DRIVER
  local: { baseDir: './storage/snapshots' }
});

logger.info(
  `DBSnap Worker starting with ${config.APP_NAME} config on port ${config.WORKER_PORT}...`,
);

const telemetry = new WorkerTelemetry(config);
telemetry.start();

telemetry.listenForControl((command) => {
  logger.info("Received worker control command", { command });
  if (command.command === 'RESTART') {
    logger.warn("Worker restart requested. Exiting...");
    process.exit(0); // Orchestrator (like Docker/PM2) should restart it
  }
});

// Simulate a background job processing loop
setInterval(() => {
  const jobId = randomUUID();
  runWithContext({ traceId: jobId }, () => {
    logger.info("Checking for pending backup jobs...");
    // In a real implementation, we would poll the DB or use a queue
    // For now, we just log the simulation
    const jobTriggered = Math.random() > 0.8; // Simulate occasional jobs

    if (jobTriggered) {
      const snapshotId = randomUUID();
      logger.info("Processing backup job", {
        jobType: "snapshot_creation",
        snapshotId
      });

      // Simulate real engine usage
      (async () => {
        try {
          // In real code, these would come from the job payload
          const { stream, metadata } = await snapshotEngine.createSnapshotStream(DatabaseType.POSTGRESQL, {
            host: 'localhost',
            port: 5432,
            database: 'dbsnap',
          });

          logger.info(`Started streaming data for ${metadata.tables.length} tables`);

          const storageKey = `${snapshotId}.jsonl`;
          const { path, size } = await storageAdapter.upload(storageKey, stream);

          logger.info("Backup uploaded successfully", {
            snapshotId,
            path,
            sizeBytes: size
          });
        } catch (err) {
          logger.error("Backup failed", { snapshotId, error: err instanceof Error ? err.message : String(err) });
        }
      })();
    }
  });
}, 10000); // Check every 10 seconds
