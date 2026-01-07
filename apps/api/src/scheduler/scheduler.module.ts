import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SchedulerService } from './scheduler.service';
import { ScalerService } from './scaler.service';
import { QueueAdminModule } from '../queues/queue-admin.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'backup-queue',
        }),
        QueueAdminModule
    ],
    providers: [SchedulerService, ScalerService],
    exports: [SchedulerService],
})
export class SchedulerModule { }
