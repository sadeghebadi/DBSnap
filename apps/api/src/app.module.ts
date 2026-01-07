import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';

import { ProjectsModule } from './projects/projects.module';
import { DatabaseModule } from './database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { SchedulerModule } from './scheduler/scheduler.module';
import { BackupsModule } from './backups/backups.module';
import { DiffsModule } from './diffs/diffs.module';
import { JobsModule } from './jobs/jobs.module';
import { QueueAdminModule } from './queues/queue-admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from './common/redis/redis.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { MaintenanceGuard } from './common/guards/maintenance.guard';
import { NotificationsModule } from './notifications/notifications.module';
import { QuotasModule } from './quotas/quotas.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        autoLogging: true,
        serializers: {
          req: (req: any) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
        },
      },
    }),
    RedisModule,
    UsersModule,
    AuthModule,
    EmailModule,
    ProjectsModule,
    DatabaseModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    SchedulerModule,
    AnalyticsModule,
    BillingModule,
    AuditLogsModule,
    MaintenanceModule,
    BackupsModule,
    DiffsModule,
    JobsModule,
    QueueAdminModule,
    NotificationsModule,
    QuotasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
  ],
})
export class AppModule { }
