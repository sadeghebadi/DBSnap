import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('auth/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAuthController {
    constructor(
        private authService: AuthService,
        private auditLogsService: AuditLogsService,
    ) { }

    @Post('impersonate/:userId')
    @Roles('ADMIN')
    async impersonate(@Request() req: any, @Param('userId') userId: string) {
        const result = await this.authService.impersonate(req.user.userId, userId);

        await this.auditLogsService.log({
            userId: req.user.userId,
            action: 'ADMIN_IMPERSONATION_START',
            resourceType: 'User',
            resourceId: userId,
            metadata: { impersonatedUserId: userId }
        });

        return result;
    }

    @Post('impersonate/stop')
    async stopImpersonate(@Request() req: any) {
        await this.auditLogsService.log({
            userId: req.user.userId, // This will be the impersonated user's ID if we use the impersonated token
            // Wait, if we use the impersonated token, req.user.userId is the user.
            // But we want to know it was an impersonation stop.
            action: 'ADMIN_IMPERSONATION_END',
            metadata: { impersonatorId: req.user.impersonatorId }
        });

        return { success: true };
    }
}
