import { Controller, Get, Post, Query, Param, Body, UseGuards, Request, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly auditLogsService: AuditLogsService,
    ) { }

    @Get()
    @Roles('ADMIN')
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        if (page < 1) page = 1;
        if (limit > 50) limit = 50;

        const skip = (page - 1) * limit;
        return this.usersService.findAll(skip, limit);
    }

    @Get(':userId')
    @Roles('ADMIN')
    async findOne(@Param('userId') userId: string) {
        return this.usersService.findById(userId);
    }

    @Post(':userId/mfa-reset')
    @Roles('ADMIN')
    async resetMfa(
        @Request() req: any,
        @Param('userId') userId: string,
        @Body('reason') reason: string,
    ) {
        const result = await this.usersService.resetMfa(userId);

        await this.auditLogsService.log({
            userId: req.user.userId,
            action: 'ADMIN_MFA_RESET',
            resourceType: 'User',
            resourceId: userId,
            metadata: { reason }
        });

        return result;
    }
}
