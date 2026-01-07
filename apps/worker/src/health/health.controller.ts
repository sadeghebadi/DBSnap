import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaClient } from '@dbsnap/database';
import { Inject } from '@nestjs/common';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private prismaHealth: PrismaHealthIndicator,
        @Inject('PRISMA_CLIENT') private prisma: PrismaClient
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.prismaHealth.pingCheck('database', this.prisma),
            // We could add Redis check here if we had a direct client, 
            // but BullMQ manages its own connection. 
            // For now, Database check is a good enough proxy for "worker has resources".
        ]);
    }
}
