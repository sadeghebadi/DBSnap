import { Module, Global } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueNames, getRedisConnection } from '@dbsnap/shared';
import { JobsService } from './jobs.service.js';
import { JobsController } from './jobs.controller.js';

@Global()
@Module({
    controllers: [JobsController],
    providers: [
        JobsService,
        {
            provide: QueueNames.BACKUP,
            useFactory: () => new Queue(QueueNames.BACKUP, { connection: getRedisConnection() }),
        },
        {
            provide: QueueNames.RESTORE,
            useFactory: () => new Queue(QueueNames.RESTORE, { connection: getRedisConnection() }),
        },
        {
            provide: QueueNames.DIFF,
            useFactory: () => new Queue(QueueNames.DIFF, { connection: getRedisConnection() }),
        },
    ],
    exports: [JobsService, QueueNames.BACKUP, QueueNames.RESTORE, QueueNames.DIFF],
})
export class JobsModule { }
