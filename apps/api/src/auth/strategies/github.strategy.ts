import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github';
import { Injectable } from '@nestjs/common';
import { env } from '@dbsnap/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private authService: AuthService) {
        super({
            clientID: 'mock-github-client-id', // env.GITHUB_CLIENT_ID
            clientSecret: 'mock-github-client-secret', // env.GITHUB_CLIENT_SECRET
            callbackURL: 'http://localhost:3000/auth/github/callback',
            scope: ['user:email'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: Function,
    ): Promise<any> {
        const { username, emails } = profile;
        const email = emails && emails[0] ? emails[0].value : null; // Handle if email is private

        // Fallback or error if email missing

        const user = await this.authService.validateOAuthUser({
            provider: 'GITHUB',
            providerId: profile.id,
            email: email, // Assuming email is available
        });
        done(null, user);
    }
}
