import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaClient, NotificationChannelType } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { WebhookService } from './webhook.service';

@Injectable()
export class NotificationOrchestratorService {
    private readonly logger = new Logger(NotificationOrchestratorService.name);

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
        private readonly emailService: EmailService,
        private readonly webhookService: WebhookService,
    ) { }

    async send(projectId: string, event: string, data: any) {
        const channels = await this.prisma.notificationChannel.findMany({
            where: {
                projectId,
                isEnabled: true,
                events: {
                    has: event,
                },
            },
        });

        if (channels.length === 0) {
            this.logger.debug(`No active notification channels for project ${projectId} and event ${event}`);
            return;
        }

        for (const channel of channels) {
            const config = channel.config as any;

            try {
                switch (channel.type) {
                    case NotificationChannelType.EMAIL:
                        // For now, reuse sendBackupSuccess. We can map events to different email methods later.
                        await this.emailService.sendBackupSuccess(config.email || 'user@example.com', {
                            databaseName: data.databaseName || 'Database',
                            sizeBytes: data.sizeBytes || '0',
                        });
                        break;

                    case NotificationChannelType.SLACK:
                        await this.webhookService.sendSlack(config.url, `*${event} Alert*\nProject: ${projectId}\nDetails: ${data.databaseName || data.diffId || 'Job completed'}`);
                        break;

                    case NotificationChannelType.WEBHOOK:
                        await this.webhookService.sendGenericWebhook(config.url, { event, projectId, data });
                        break;

                    default:
                        this.logger.warn(`Unsupported channel type: ${channel.type}`);
                }
            } catch (error: any) {
                this.logger.error(`Failed to dispatch notification to ${channel.type}: ${error.message}`);
            }
        }
    }
}
