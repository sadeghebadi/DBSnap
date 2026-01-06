import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { env } from '@dbsnap/config';

import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  await app.listen(env.PORT);
  const logger = app.get(Logger);
  logger.log(`API running on ${env.API_URL}`);
}
bootstrap();
