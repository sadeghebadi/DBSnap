import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    async sendBackupSuccess(email: string, details: { databaseName: string, sizeBytes: string }) {
        this.logger.log(`[Mock] Sending Backup Success Email to ${email} for DB ${details.databaseName} (${details.sizeBytes})`);
    }

    async sendBackupFailure(email: string, details: { databaseName: string, error: string }) {
        this.logger.error(`[Mock] Sending Backup Failure Email to ${email} for DB ${details.databaseName}. Error: ${details.error}`);
    }

    async sendDiffReady(email: string, details: { diffId: string, summary: string }) {
        this.logger.log(`[Mock] Sending Diff Ready Email to ${email}. ID: ${details.diffId}`);
    }
}
