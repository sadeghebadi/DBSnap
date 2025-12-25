import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { getConfig } from '@dbsnap/shared';
import { AuthService } from '../auth.service.js';

const config = getConfig();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        super({
            clientID: config.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
            clientSecret: config.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
            callbackURL: config.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { id, emails, displayName } = profile;
        const user = await this.authService.validateOAuthUser({
            email: emails[0].value,
            googleId: id,
            displayName,
        });
        done(null, user);
    }
}
