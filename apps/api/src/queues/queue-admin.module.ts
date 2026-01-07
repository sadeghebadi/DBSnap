import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueAdminController } from './queue-admin.controller';
import { QueueAdminService } from './queue-admin.service';
import { BACKUP_QUEUE, RESTORE_QUEUE, DIFF_QUEUE } from './queue.constants';

@Module({
    imports: [
        BullModule.registerQueue(
            { name: BACKUP_QUEUE },
            { name: RESTORE_QUEUE },
            { name: DIFF_QUEUE },
        ),
    ],
    controllers: [QueueAdminController],
    providers: [QueueAdminService],
    exports: [QueueAdminService],
})
export class QueueAdminModule { }
