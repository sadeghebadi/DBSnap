import { SetMetadata } from '@nestjs/common';

export type ResourceType = 'projects' | 'databases';

export const CHECK_PLAN_LIMIT = 'check_plan_limit';
export const PlanLimit = (resource: ResourceType) => SetMetadata(CHECK_PLAN_LIMIT, resource);
