import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { env } from '@dbsnap/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        super({
            clientID: 'mock-google-client-id', // env.GOOGLE_CLIENT_ID
            clientSecret: 'mock-google-client-secret', // env.GOOGLE_CLIENT_SECRET
            callbackURL: 'http://localhost:3000/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos } = profile;
        const user = await this.authService.validateOAuthUser({
            provider: 'GOOGLE',
            providerId: profile.id,
            email: emails[0].value,
            name: name.givenName + ' ' + name.familyName,
        });
        done(null, user);
    }
}
