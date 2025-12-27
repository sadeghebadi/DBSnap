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

import { LoggerService } from './common/logger/logger.service.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
    imports: [
        DatabaseModule,
        MailModule,
        AuthModule,
        ApiKeysModule,
        ProjectsModule,
        ConnectionsModule,
        AdminModule, // Re-enabled without BullModule dependency
        BillingModule,
        PromoCodesModule,
        BackupsModule,
    ],
    providers: [
        LoggerService,
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(MaintenanceMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
