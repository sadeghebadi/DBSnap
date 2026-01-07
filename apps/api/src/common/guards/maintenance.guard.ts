import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ServiceUnavailableException,
} from '@nestjs/common';
import { MaintenanceService } from '../../maintenance/maintenance.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MaintenanceGuard implements CanActivate {
    constructor(
        private readonly maintenanceService: MaintenanceService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Skip check for maintenance controller itself to avoid deadlock
        const request = context.switchToHttp().getRequest();
        if (request.url.includes('/maintenance/status') || request.url.includes('/maintenance/toggle')) {
            return true;
        }

        const status = await this.maintenanceService.getStatus();
        if (!status.enabled) {
            return true;
        }

        // Allow whitelisted IPs
        const ip = request.ip || request.headers['x-forwarded-for'];
        if (status.whitelist.includes(ip)) {
            return true;
        }

        // Optional: Allow Admins to bypass maintenance if they already have a token
        // But for strict maintenance, we might want to block them too unless whitelisted by IP

        throw new ServiceUnavailableException({
            message: status.message || 'System is currently undergoing maintenance.',
            statusCode: 503,
        });
    }
}
