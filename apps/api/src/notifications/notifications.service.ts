import { Injectable, Inject } from '@nestjs/common';
import { MailService } from '../mail/mail.service.js';
import { createLogger, getConfig } from '@dbsnap/shared';
import { Job } from 'bullmq';

const logger = createLogger('notifications-service');

@Injectable()
export class NotificationsService {
    constructor(private readonly mailService: MailService) { }

    async handleNotification(job: Job) {
        const { type, status, userEmail, connectionName, details, resultKey } = job.data;
        const config = getConfig();

        logger.info(`Processing ${type} notification for ${userEmail} (Status: ${status})`);

        const subject = `DBSnap: ${type} ${status.toUpperCase()} - ${connectionName}`;
        let message = `Your ${type} for "${connectionName}" has ${status}.`;

        if (status === 'failed' && details) {
            message += `\n\nError: ${details}`;
        }

        if (status === 'completed' && resultKey) {
            message += `\n\nResult: ${resultKey}`;
        }

        // 1. Send Email
        try {
            await this.mailService.sendEmail(userEmail, subject, message);
            logger.info(`Email sent to ${userEmail}`);
        } catch (err: any) {
            logger.error(`Failed to send email to ${userEmail}: ${err.message}`);
        }

        // 2. Send Slack (if configured)
        if (config.SLACK_WEBHOOK_URL) {
            try {
                await this.sendSlackNotification(config.SLACK_WEBHOOK_URL, {
                    text: `*${subject}*\n${message}`,
                });
                logger.info(`Slack notification sent for ${userEmail}`);
            } catch (err: any) {
                logger.error(`Failed to send Slack notification: ${err.message}`);
            }
        }
    }

    private async sendSlackNotification(url: string, payload: any) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Slack API responded with status ${response.status}`);
        }
    }
}

// Note: mail.service.ts currently doesn't have a generic sendEmail method, 
// I should probably add one or update the implementation.
