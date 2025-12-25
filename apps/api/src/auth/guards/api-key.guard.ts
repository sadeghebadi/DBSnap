import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from '../../api-keys/api-keys.service.js';
import { SCOPES_KEY } from '../decorators/scopes.decorator.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private apiKeysService: ApiKeysService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            return false; // Let other guards handle it or fail
        }

        const { user, scopes: keyScopes } = await this.apiKeysService.validateKey(apiKey);

        // Attach user to request
        request.user = user;
        request.apiKeyScopes = keyScopes;

        // Check scopes if required
        const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredScopes || requiredScopes.length === 0) {
            return true;
        }

        const hasScope = requiredScopes.every((scope) => keyScopes.includes(scope));
        if (!hasScope) {
            throw new ForbiddenException('Insufficient scopes');
        }

        return true;
    }
}
