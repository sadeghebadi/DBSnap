import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';

import { env } from '@dbsnap/config';

import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ContextInterceptor } from './common/interceptors/context.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalInterceptors(new ContextInterceptor());

  await app.listen(env.PORT);
  const logger = app.get(Logger);
  logger.log(`API running on ${env.API_URL}`);
}
bootstrap();
