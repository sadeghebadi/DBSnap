import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from '@dbsnap/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule } from '../email/email.module';

import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { MfaService } from './mfa.service';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
    EmailModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy, GithubStrategy, MfaService, SessionsService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
