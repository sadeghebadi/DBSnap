import { NestFactory } from '@nestjs/core';
import { getConfig } from '@dbsnap/shared';

async function bootstrap() {
    const config = getConfig();
    console.log(`DBSnap API starting on port ${config.API_PORT}...`);
    // Minimal placeholder
}
bootstrap();
