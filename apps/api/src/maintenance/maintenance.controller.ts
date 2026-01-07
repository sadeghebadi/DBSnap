import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('maintenance')
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Get('status')
    async getStatus() {
        return this.maintenanceService.getStatus();
    }

    @Post('toggle')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async toggleMaintenance(
        @Body('enabled') enabled: boolean,
        @Body('message') message: string,
        @Body('whitelist') whitelist: string[],
    ) {
        await this.maintenanceService.setMaintenance(enabled, message, whitelist);
        return { success: true };
    }
}
