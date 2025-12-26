import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { MailModule } from './mail/mail.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ApiKeysModule } from './api-keys/api-keys.module.js';
import { BackupsModule } from './backups/backups.module.js';
import { ConnectionsModule } from './connections/connections.module.js';
import { AdminModule } from './admin/admin.module.js';
import { BillingModule } from './billing/billing.module.js';
import { PromoCodesModule } from './promo-codes/promo-codes.module.js';
import { SnapshotsModule } from './snapshots/snapshots.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { DiffsModule } from './diffs/diffs.module.js';

import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { getConfig } from '@dbsnap/shared';
import { MaintenanceMiddleware } from './admin/maintenance.middleware.js';

const config = getConfig();

@Module({
    imports: [
        ScheduleModule.forRoot(),
        BullModule.forRoot({
            connection: {
                url: config.REDIS_URL,
            },
        }),
        DatabaseModule,
        MailModule,
        AuthModule,
        ApiKeysModule,
        ProjectsModule,
        ConnectionsModule,
        BackupsModule,
        AdminModule,
        BillingModule,
        PromoCodesModule,
        JobsModule,
        SnapshotsModule,
        NotificationsModule,
        DiffsModule,
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(MaintenanceMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
