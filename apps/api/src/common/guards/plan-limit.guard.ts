import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingService } from '../../billing/billing.service';
import { CHECK_PLAN_LIMIT, ResourceType } from '../decorators/plan-limit.decorator';

@Injectable()
export class PlanLimitGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private billingService: BillingService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const resource = this.reflector.get<ResourceType>(CHECK_PLAN_LIMIT, context.getHandler());
        if (!resource) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) return false;

        const status = await this.billingService.getSubscriptionStatus(user.userId);

        if (status.usage[resource] >= status.limits[resource]) {
            throw new ForbiddenException(`Plan limit reached for ${resource}. Please upgrade your plan.`);
        }

        return true;
    }
}
