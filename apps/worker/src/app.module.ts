import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { BackupProcessor } from './processors/backup.processor';
import { EncryptionModule } from './encryption/encryption.module';
import { DumperModule } from './dumpers/dumper.module';
import { StorageModule } from './storage/storage.module';
import { RestorerModule } from './restorers/restorer.module';
import { RestoreProcessor } from './processors/restore.processor';
import { PrismaClient } from '@dbsnap/database';
import { DiffProcessor } from './processors/diff.processor';
import { ComplianceProcessor } from './processors/compliance.processor';
import { BACKUP_QUEUE, RESTORE_QUEUE, DIFF_QUEUE, COMPLIANCE_QUEUE } from './queues/queue.constants';
import { EmailModule } from './email/email.module';
import { AnalysisModule } from './analysis/analysis.module';
import { HealthModule } from './health/health.module';
import { MonitorModule } from './monitor/monitor.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue(
      { name: BACKUP_QUEUE },
      { name: RESTORE_QUEUE },
      { name: DIFF_QUEUE },
      { name: COMPLIANCE_QUEUE },
    ),
    EncryptionModule,
    DumperModule,
    StorageModule,
    RestorerModule,
    EmailModule,
    AnalysisModule,
    HealthModule,
    MonitorModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BackupProcessor,
    RestoreProcessor,
    DiffProcessor,
    ComplianceProcessor,
    {
      provide: 'PRISMA_CLIENT',
      useFactory: () => {
        const prisma = new PrismaClient();
        return prisma;
      }
    }
  ],
})
export class AppModule { }
