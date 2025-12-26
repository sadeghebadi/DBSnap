import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { getConfig } from '@dbsnap/shared';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
    private redis: Redis;
    private config = getConfig();

    constructor() {
        this.redis = new Redis(this.config.REDIS_URL, {
            maxRetriesPerRequest: null,
        });
    }

    async use(req: Request, res: Response, next: NextFunction) {
        // Skip maintenance check for admin login or specific admin routes if needed
        // but for now, let's allow all /api/admin routes to bypass so admins can turn it off
        if (req.path.startsWith('/api/admin')) {
            return next();
        }

        const maintenance = await this.redis.get(this.config.MAINTENANCE_MODE_KEY);

        if (maintenance) {
            const maintenanceData = JSON.parse(maintenance);

            // Whitelist check
            const clientIp = req.ip || req.socket.remoteAddress;
            if (maintenanceData.whitelist && maintenanceData.whitelist.includes(clientIp)) {
                return next();
            }

            throw new ServiceUnavailableException({
                message: maintenanceData.message || 'System is currently under maintenance. Please try again later.',
                retryAfter: 3600,
            });
        }

        next();
    }
}
