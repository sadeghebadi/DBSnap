import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { MailModule } from './mail/mail.module.js';

@Module({
    imports: [DatabaseModule, MailModule, AuthModule],
})
export class AppModule { }
