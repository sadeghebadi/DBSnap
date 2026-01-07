import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../common/redis/redis.module';

@Injectable()
export class MaintenanceService {
    private readonly REDIS_KEY = 'maintenance_mode';

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

    async setMaintenance(enabled: boolean, message: string = 'System is currently undergoing maintenance.', whitelist: string[] = []) {
        await this.redis.set(this.REDIS_KEY, JSON.stringify({
            enabled,
            message,
            whitelist,
        }));
    }

    async getStatus() {
        const data = await this.redis.get(this.REDIS_KEY);
        if (!data) {
            return { enabled: false, message: '', whitelist: [] };
        }
        return JSON.parse(data);
    }

    async isWhitelisted(ip: string) {
        const status = await this.getStatus();
        if (!status.enabled) return true;
        return status.whitelist.includes(ip);
    }
}
