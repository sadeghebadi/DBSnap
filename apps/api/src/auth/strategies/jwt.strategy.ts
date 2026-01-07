import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { env } from '@dbsnap/config';

import { SessionsService } from '../sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private sessionsService: SessionsService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        if (payload.sid) {
            const isValid = await this.sessionsService.validateSession(payload.sid);
            if (!isValid) return null;
        }
        return { userId: payload.sub, email: payload.email, sessionId: payload.sid, role: payload.role };
    }
}
