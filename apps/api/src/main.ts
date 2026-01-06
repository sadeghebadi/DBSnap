import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { env } from '@dbsnap/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.PORT);
  console.log(`API running on ${env.API_URL}`);
}
bootstrap();
