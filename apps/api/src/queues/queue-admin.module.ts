import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueAdminController } from './queue-admin.controller';
import { QueueAdminService } from './queue-admin.service';
import { BACKUP_QUEUE, RESTORE_QUEUE, DIFF_QUEUE } from './queue.constants';

import { HealthController } from './health.controller';

@Module({
    imports: [
        BullModule.registerQueue({ name: BACKUP_QUEUE }),
        BullModule.registerQueue({ name: RESTORE_QUEUE }),
        BullModule.registerQueue({ name: DIFF_QUEUE }),
    ],
    controllers: [QueueAdminController, HealthController],
    providers: [QueueAdminService],
    exports: [QueueAdminService],
})
export class QueueAdminModule { }
