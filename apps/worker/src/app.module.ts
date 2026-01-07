import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { BackupProcessor } from './processors/backup.processor';
import { BACKUP_QUEUE_NAME } from './queues/backup.queue';
import { EncryptionModule } from './encryption/encryption.module';
import { DumperModule } from './dumpers/dumper.module';
import { StorageModule } from './storage/storage.module';
import { RestorerModule } from './restorers/restorer.module';
import { RestoreProcessor } from './processors/restore.processor';
import { RESTORE_QUEUE_NAME } from './queues/restore.queue';
import { PrismaClient } from '@dbsnap/database';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: BACKUP_QUEUE_NAME,
    }),
    BullModule.registerQueue({
      name: RESTORE_QUEUE_NAME,
    }),
    EncryptionModule,
    DumperModule,
    StorageModule,
    RestorerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    BackupProcessor,
    RestoreProcessor,
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
