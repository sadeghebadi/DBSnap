import { Module } from '@nestjs/common';
import { DiffsController } from './diffs.controller';
import { DiffsService } from './diffs.service';
import { DatabaseModule } from '../database/database.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LiveDiffService } from './live-diff.service';
import { LiveDiffController } from './live-diff.controller';
import { BullModule } from '@nestjs/bullmq';
import { BACKUP_QUEUE, DIFF_QUEUE } from '../queues/queue.constants';

@Module({
    imports: [
        DatabaseModule,
        EncryptionModule,
        PrismaModule,
        BullModule.registerQueue(
            { name: BACKUP_QUEUE },
            { name: DIFF_QUEUE }
        )
    ],
    controllers: [DiffsController, LiveDiffController],
    providers: [
        DiffsService,
        LiveDiffService,
    ],
})
export class DiffsModule { }
