
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Assuming user.role is a string (Role name) or user.roles is an array
        // Based on our schema, User has optional Role. 
        // We will normalize in JwtStrategy or AuthService to put role name in 'role' or 'roles'
        if (!user || !user.role) {
            return false;
        }

        // If roles array contains the user's role
        return roles.includes(user.role);
    }
}
