import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../common/redis/redis.module';

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);
    private s3: S3Client;

    constructor(
        private prisma: PrismaService,
        @Inject(REDIS_CLIENT) private redis: Redis,
    ) {
        this.s3 = new S3Client({
            region: process.env.S3_REGION || 'us-east-1',
            endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY || 'minio',
                secretAccessKey: process.env.S3_SECRET_KEY || 'minio123',
            },
            forcePathStyle: true,
        });
    }

    async check() {
        const results = await Promise.allSettled([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkS3(),
        ]);

        const status = results.every((r) => r.status === 'fulfilled') ? 'ok' : 'error';
        const details = {
            database: results[0].status === 'fulfilled' ? 'ok' : (results[0] as any).reason.message,
            redis: results[1].status === 'fulfilled' ? 'ok' : (results[1] as any).reason.message,
            s3: results[2].status === 'fulfilled' ? 'ok' : (results[2] as any).reason.message,
        };

        return { status, details };
    }

    private async checkDatabase() {
        await (this.prisma as any).$queryRaw`SELECT 1`;
    }

    private async checkRedis() {
        await this.redis.ping();
    }

    private async checkS3() {
        await this.s3.send(new ListBucketsCommand({}));
    }
}
