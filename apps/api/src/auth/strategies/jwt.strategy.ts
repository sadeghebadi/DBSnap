import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getConfig } from '@dbsnap/shared';
import { AuthService } from '../auth.service.js';

const config = getConfig();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.JWT_SECRET || 'fallback_secret',
        });
    }

    async validate(payload: { sub: string; email: string; role: string; isVerified: boolean; sid?: string }) {
        // Check if session ID is present and valid
        if (payload.sid) {
            const isValid = await this.authService.isSessionValid(payload.sid);
            if (!isValid) {
                throw new UnauthorizedException('Session is no longer valid');
            }
        }

        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            isVerified: payload.isVerified,
            sid: payload.sid
        };
    }
}
