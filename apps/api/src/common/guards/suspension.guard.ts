import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuspensionGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { user, params } = context.switchToHttp().getRequest();

        if (!user) return true;

        // 1. Check User Suspension
        const dbUser = await (this.prisma as any).user.findUnique({
            where: { id: user.sub || user.id },
            select: { isSuspended: true, suspensionReason: true }
        });

        if (dbUser?.isSuspended) {
            throw new ForbiddenException(dbUser.suspensionReason || 'Your account has been suspended.');
        }

        // 2. Check Project Suspension (if projectId is in params)
        const projectId = params.projectId || params.id;
        if (projectId && context.switchToHttp().getRequest().url.includes('projects')) {
            const project = await (this.prisma as any).project.findUnique({
                where: { id: projectId },
                select: { isSuspended: true, suspensionReason: true }
            });

            if (project?.isSuspended) {
                throw new ForbiddenException(project.suspensionReason || 'This project has been suspended.');
            }
        }

        return true;
    }
}
