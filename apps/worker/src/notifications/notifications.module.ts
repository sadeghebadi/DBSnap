import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { NotificationOrchestratorService } from './notification-orchestrator.service';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [EmailModule],
    providers: [
        WebhookService,
        NotificationOrchestratorService,
        {
            provide: 'PRISMA_CLIENT',
            useFactory: () => {
                const { PrismaClient } = require('@prisma/client');
                return new PrismaClient();
            },
        },
    ],
    exports: [NotificationOrchestratorService],
})
export class NotificationsModule { }
