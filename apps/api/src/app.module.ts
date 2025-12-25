import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { MailModule } from './mail/mail.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ApiKeysModule } from './api-keys/api-keys.module.js';

@Module({
    imports: [DatabaseModule, MailModule, AuthModule, ProjectsModule, ApiKeysModule],
})
export class AppModule { }
