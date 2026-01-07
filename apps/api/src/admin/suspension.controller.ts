import { Controller, Post, Body, Param, UseGuards, Patch, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { EmailService } from '../email/email.service';

@Controller('admin/suspension')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SuspensionController {
    constructor(
        private prisma: PrismaService,
        private auditLogs: AuditLogsService,
        private emailService: EmailService,
    ) { }

    @Patch('users/:id')
    async toggleUserSuspension(
        @Param('id') id: string,
        @Body() body: { isSuspended: boolean; reason?: string; internalNote?: string }
    ) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                isSuspended: body.isSuspended,
                suspensionReason: body.reason,
                suspensionInternalNote: body.internalNote
            }
        });

        await this.auditLogs.createLog({
            userId: id, // Target user
            action: body.isSuspended ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
            resourceType: 'User',
            resourceId: id,
            metadata: {
                reason: body.reason,
                internalNote: body.internalNote,
                suspendedBy: 'ADMIN' // Context is usually captured by interceptor, but good to be explicit
            }
        });

        if (body.isSuspended) {
            await this.emailService.sendGenericEmail(
                user.email,
                'Important: Your DBSnap Account Status',
                `Your account has been suspended for the following reason: ${body.reason || 'Safety/Compliance reasons'}. Please contact support if you believe this is an error.`
            );
        }

        return updatedUser;
    }

    @Patch('projects/:id')
    async toggleProjectSuspension(
        @Param('id') id: string,
        @Body() body: { isSuspended: boolean; reason?: string; internalNote?: string }
    ) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!project) throw new NotFoundException('Project not found');

        const updatedProject = await this.prisma.project.update({
            where: { id },
            data: {
                isSuspended: body.isSuspended,
                suspensionReason: body.reason,
                suspensionInternalNote: body.internalNote
            }
        });

        await this.auditLogs.createLog({
            userId: project.userId,
            action: body.isSuspended ? 'PROJECT_SUSPENDED' : 'PROJECT_REACTIVATED',
            resourceType: 'Project',
            resourceId: id,
            metadata: {
                reason: body.reason,
                internalNote: body.internalNote
            }
        });

        if (body.isSuspended) {
            await this.emailService.sendGenericEmail(
                project.user.email,
                `Important: Project ${project.name} Suspended`,
                `Your project "${project.name}" has been suspended. Reason: ${body.reason || 'None provided'}. Scheduled backups for this project are now paused.`
            );
        }

        return updatedProject;
    }
}
