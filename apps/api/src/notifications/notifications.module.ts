import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { QueueNames, getRedisConnection, createLogger } from '@dbsnap/shared';
import { NotificationsService } from './notifications.service.js';
import { MailModule } from '../mail/mail.module.js';

const logger = createLogger('notifications-module');

@Module({
    imports: [MailModule],
    providers: [
        NotificationsService,
        {
            provide: QueueNames.NOTIFICATIONS,
            useFactory: () => new Queue(QueueNames.NOTIFICATIONS, { connection: getRedisConnection() }),
        },
    ],
    exports: [QueueNames.NOTIFICATIONS, NotificationsService],
})
export class NotificationsModule implements OnModuleInit {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) { }

    onModuleInit() {
        console.log('[NotificationsModule] Starting onModuleInit...');
        const connection = getRedisConnection();
        console.log('[NotificationsModule] Got Redis connection config:', connection);

        const worker = new Worker(QueueNames.NOTIFICATIONS, async (job) => {
            await this.notificationsService.handleNotification(job);
        }, {
            connection,
            concurrency: 5,
        });

        worker.on('completed', (job) => {
            logger.info(`Notification job ${job.id} completed`);
        });

        worker.on('failed', (job, err) => {
            logger.error(`Notification job ${job?.id} failed: ${err.message}`);
        });

        logger.info('Notifications Worker started');
        console.log('[NotificationsModule] onModuleInit completed');
    }
}
