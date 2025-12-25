import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { GithubStrategy } from './strategies/github.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { MailModule } from '../mail/mail.module.js';
import { getConfig } from '@dbsnap/shared';

const config = getConfig();

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: config.JWT_SECRET || 'fallback_secret',
            signOptions: { expiresIn: '1h' },
        }),
        MailModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GithubStrategy, GoogleStrategy],
    exports: [AuthService],
})
export class AuthModule { }
