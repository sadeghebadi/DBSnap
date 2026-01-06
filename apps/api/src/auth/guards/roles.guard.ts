import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) return false;

        // Fetch user with role relation to be safe, or assume JWT strategy added role info?
        // JWT strategy currently only adds userId and email.
        // We should probably fetch the full user or updated JWT strategy.
        // For now let's fetch.
        const dbUser = await this.usersService.findOne(user.email); // or by ID if available

        if (!dbUser || !dbUser.role) return false; // User has no role assigned

        return requiredRoles.some((role) => dbUser.role?.name === role);
    }
}
