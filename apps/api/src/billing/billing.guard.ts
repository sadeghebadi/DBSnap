import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class BillingGuard implements CanActivate {
    constructor(
        private billingService: BillingService,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.organizationId) {
            return true; // Or false depending on whether you want to require an org
        }

        // Example: If the request is for creating a snapshot
        if (request.method === 'POST' && request.url.includes('snapshots')) {
            const currentCount = await this.prisma.backupSnapshot.count({
                where: {
                    connection: {
                        project: {
                            organizationId: user.organizationId
                        }
                    }
                }
            });

            const canCreate = await this.billingService.checkLimit(user.organizationId, 'maxSnapshots', currentCount);
            if (!canCreate) {
                throw new ForbiddenException('Your current plan limit for snapshots has been reached. Please upgrade to create more.');
            }
        }

        // Add more checks for connections, projects, storage, etc.

        return true;
    }
}
