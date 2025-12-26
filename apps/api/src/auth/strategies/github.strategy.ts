import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { getConfig } from '@dbsnap/shared';
import { AuthService } from '../auth.service.js';

const config = getConfig();

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private authService: AuthService) {
        super({
            clientID: config.GITHUB_CLIENT_ID || 'GITHUB_CLIENT_ID',
            clientSecret: config.GITHUB_CLIENT_SECRET || 'GITHUB_CLIENT_SECRET',
            callbackURL: config.GITHUB_CALLBACK_URL || 'http://localhost:4000/auth/github/callback',
            scope: ['user:email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: { id: string; emails: { value: string }[]; displayName: string }) {
        const { id, emails, displayName } = profile;
        return this.authService.validateOAuthUser({
            email: emails[0].value,
            githubId: id,
            displayName,
        });
    }
}
