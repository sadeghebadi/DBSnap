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
import { ApiKeysService } from './api-keys.service';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { ApiKeysController } from './api-keys.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
    EmailModule,
    AuditLogsModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
    MfaService,
    SessionsService,
    ApiKeysService,
    ApiKeyStrategy,
  ],
  controllers: [AuthController, ApiKeysController, AdminAuthController],
  exports: [AuthService],
})
export class AuthModule { }
