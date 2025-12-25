import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { MailModule } from './mail/mail.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ApiKeysModule } from './api-keys/api-keys.module.js';
import { BackupsModule } from './backups/backups.module.js';
import { ConnectionsModule } from './connections/connections.module.js';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        DatabaseModule,
        MailModule,
        AuthModule,
        ApiKeysModule,
        BackupsModule,
    ],
})
export class AppModule { }
