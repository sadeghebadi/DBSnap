import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    async sendSlack(url: string, text: string, blocks?: any[]) {
        try {
            await axios.post(url, {
                text,
                blocks,
            });
            this.logger.log(`Slack notification sent to ${url}`);
        } catch (error: any) {
            this.logger.error(`Failed to send Slack notification: ${error.message}`);
        }
    }

    async sendGenericWebhook(url: string, payload: any) {
        try {
            await axios.post(url, payload);
            this.logger.log(`Generic webhook sent to ${url}`);
        } catch (error: any) {
            this.logger.error(`Failed to send generic webhook: ${error.message}`);
        }
    }
}
