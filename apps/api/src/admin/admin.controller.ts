import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';
import { UserRole } from '@dbsnap/shared';
import { AdminService } from './admin.service.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, VerifiedGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('users')
    async listUsers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string
    ) {
        return this.adminService.listUsers(parseInt(page), parseInt(limit), search);
    }

    @Get('events')
    async getRecentEvents() {
        return this.adminService.getRecentEvents();
    }
}
