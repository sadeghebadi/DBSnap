import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { getConfig, createLogger } from "@dbsnap/shared";

const logger = createLogger('api');

async function bootstrap() {
  console.log('[Bootstrap] Starting bootstrap...');
  const config = getConfig();
  console.log('[Bootstrap] Config loaded, creating Nest application...');
  const app = await NestFactory.create(AppModule);
  console.log('[Bootstrap] Nest application created');

  const port = config.API_PORT || 3000;
  console.log(`[Bootstrap] Listening on port ${port}...`);
  await app.listen(port);
  logger.info(`DBSnap API running on port ${port}`);
}

bootstrap().catch((err) => {
  logger.error("Failed to bootstrap API", { error: err.message });
  console.error('[Bootstrap] Error:', err);
  process.exit(1);
});
