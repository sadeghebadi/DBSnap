import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueueAdminService } from './queue-admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('health')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HealthController {
    constructor(private readonly queueAdminService: QueueAdminService) { }

    @Get('stats')
    @Roles('ADMIN')
    async getStats() {
        const queueStats = await this.queueAdminService.getGlobalQueueStats();

        // In a real app, we might add CPU/Memory usage here from 'os' module
        // For now, focusing on Queue Health as requested
        return {
            queues: queueStats,
            timestamp: new Date().toISOString(),
            status: 'OK'
        };
    }
}
