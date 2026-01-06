import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { env } from '@dbsnap/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Workers might not need to listen to HTTP, but for health checks:
  await app.listen(env.PORT + 1);
  console.log(`Worker running`);
}
bootstrap();
