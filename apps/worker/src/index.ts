import { getConfig, createLogger, runWithContext } from "@dbsnap/shared";
import { randomUUID } from 'crypto';

const config = getConfig();
const logger = createLogger('worker');

logger.info(
  `DBSnap Worker starting with ${config.APP_NAME} config on port ${config.WORKER_PORT}...`,
);

// Simulate a background job
const jobId = randomUUID();
runWithContext({ traceId: jobId }, () => {
  logger.info("Processing background job", { jobType: "email_notification" });
  // ... job logic ...
  logger.info("Job completed successfully");
});
