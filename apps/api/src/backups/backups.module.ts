import { Module } from '@nestjs/common';
import { BackupsController } from './backups.controller';
import { BackupsService } from './backups.service';
import { DatabaseModule } from '../database/database.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { PrismaClient } from '@dbsnap/database';

import { BullModule } from '@nestjs/bullmq';
import { BACKUP_QUEUE, RESTORE_QUEUE } from '../queues/queue.constants';

@Module({
    imports: [
        DatabaseModule,
        EncryptionModule,
        BullModule.registerQueue(
            { name: BACKUP_QUEUE },
            { name: RESTORE_QUEUE },
        )
    ],
    controllers: [BackupsController],
    providers: [
        BackupsService,
        {
            provide: PrismaClient,
            useClass: PrismaClient
        }
    ],
    exports: [BackupsService]
})
export class BackupsModule { }
