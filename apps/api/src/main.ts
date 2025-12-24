import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { getConfig, createLogger } from "@dbsnap/shared";

const logger = createLogger('api');

async function bootstrap() {
  const config = getConfig();
  const app = await NestFactory.create(AppModule);

  const port = config.API_PORT || 3000;

  await app.listen(port);
  logger.info(`DBSnap API running on port ${port}`);
}

bootstrap().catch((err) => {
  logger.error("Failed to bootstrap API", { error: err.message });
  process.exit(1);
});
