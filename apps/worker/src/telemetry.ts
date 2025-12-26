import { Redis } from 'ioredis';
import { Config } from '@dbsnap/shared';
import os from 'os';

export class WorkerTelemetry {
    private redis: Redis;
    private workerId: string;
    private interval: NodeJS.Timeout | null = null;

    constructor(private config: Config) {
        this.redis = new Redis(this.config.REDIS_URL, {
            maxRetriesPerRequest: null,
        });
        this.workerId = `worker-${os.hostname()}-${process.pid}`;
    }

    start() {
        this.interval = setInterval(() => this.sendHeartbeat(), 10000);
        this.sendHeartbeat();
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.redis.del(`dbsnap:worker:telemetry:${this.workerId}`);
    }

    private async sendHeartbeat() {
        const telemetry = {
            id: this.workerId,
            hostname: os.hostname(),
            pid: process.pid,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            lastHeartbeat: new Date().toISOString(),
            status: 'ACTIVE',
        };

        await this.redis.set(
            `dbsnap:worker:telemetry:${this.workerId}`,
            JSON.stringify(telemetry),
            'EX',
            30 // Expire in 30 seconds if heartbeat stops
        );
    }

    async listenForControl(callback: (command: { command: string; workerId?: string; concurrency?: number }) => void) {
        const sub = new Redis(this.config.REDIS_URL);
        sub.subscribe('dbsnap-worker-control');
        sub.on('message', (channel, message) => {
            if (channel === 'dbsnap-worker-control') {
                const command = JSON.parse(message);
                if (!command.workerId || command.workerId === this.workerId) {
                    callback(command);
                }
            }
        });
    }
}
