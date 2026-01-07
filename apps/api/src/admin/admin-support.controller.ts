
import { Controller, Post, Param, UseGuards, Body, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConnectionsService } from '../projects/connections.service';
import { BackupsService } from '../backups/backups.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ROOT')
export class AdminSupportController {
    constructor(
        private connectionsService: ConnectionsService,
        private backupsService: BackupsService,
        private prisma: PrismaService
    ) { }

    @Post('databases/:id/test-connection')
    async testConnection(@Param('id') id: string, @Request() req: any) {
        // Audit Log
        await this.prisma.auditLog.create({
            data: {
                userId: req.user.userId,
                action: 'ADMIN_TEST_CONNECTION',
                resourceType: 'Database',
                resourceId: id,
                metadata: { timestamp: new Date() }
            }
        });

        return this.connectionsService.testConnection(id);
    }

    @Post('databases/:id/trigger-backup')
    async triggerBackup(@Param('id') id: string, @Request() req: any) {
        // Audit is handled inside service via metadata tag, but we also log the API call here
        await this.prisma.auditLog.create({
            data: {
                userId: req.user.userId,
                action: 'ADMIN_TRIGGER_BACKUP',
                resourceType: 'Database',
                resourceId: id,
                metadata: { timestamp: new Date() }
            }
        });

        return this.backupsService.triggerBackup(id, {
            triggeredByAdmin: true,
            adminId: req.user.userId
        });
    }
}
