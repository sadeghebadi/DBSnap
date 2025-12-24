// import { NestFactory } from '@nestjs/core';
import { getConfig, createLogger, runWithContext } from "@dbsnap/shared";
import { User } from "@dbsnap/database";
import { randomUUID } from 'crypto';

const logger = createLogger('api');

async function bootstrap() {
  const config = getConfig();
  logger.info(`DBSnap API starting on port ${config.API_PORT}...`);

  // Simulate a request to demonstrate structured logging and trace ID
  const traceId = randomUUID();
  runWithContext({ traceId }, () => {
    logger.info("Simulated request started", { path: "/health" });

    // Verify User model implementation (Issue-010)
    const dummyUser: Partial<User> = {
      email: "test@example.com",
      createdAt: new Date()
    };
    logger.info("User model verification", { dummyUser });

    // ... application logic ...
    logger.info("Simulated request completed");
  });
}
bootstrap();
