import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import * as os from 'os';
import * as process from 'process';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WorkerMonitorService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(WorkerMonitorService.name);
    private readonly workerId = uuidv4();
    private readonly redis: Redis;
    private heartbeatInterval: NodeJS.Timeout;

    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
    }

    async onModuleInit() {
        this.logger.log(`Worker Monitor initialized. ID: ${this.workerId}`);
        this.startHeartbeat();
        this.subscribeToCommands();
    }

    onModuleDestroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.redis.disconnect();
    }

    private startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            const stats = {
                id: this.workerId,
                pid: process.pid,
                hostname: os.hostname(),
                platform: os.platform(),
                cpuUsage: process.cpuUsage(),
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '0.0.1',
            };

            await this.redis.setex(
                `worker:stats:${this.workerId}`,
                30, // 30s TTL
                JSON.stringify(stats)
            );
        }, 10000); // Every 10s
    }

    private subscribeToCommands() {
        const subRedis = this.redis.duplicate();
        subRedis.subscribe('worker:commands');
        subRedis.on('message', (channel, message) => {
            if (channel === 'worker:commands') {
                const { targetId, command } = JSON.parse(message);
                if (targetId === 'all' || targetId === this.workerId) {
                    this.handleCommand(command);
                }
            }
        });
    }

    private handleCommand(command: string) {
        this.logger.log(`Received command: ${command}`);
        if (command === 'RESTART') {
            this.logger.warn('Restart command received. Shutting down...');
            process.exit(0); // Orchestrator (Docker/PM2) should restart the container
        }
    }
}
