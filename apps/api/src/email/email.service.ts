import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    async sendVerificationEmail(email: string, token: string) {
        this.logger.log(`[Mock] Sending Verification Email to ${email} with token: ${token}`);
        // In production, use nodemailer or similar
    }

    async sendPasswordResetEmail(email: string, token: string) {
        this.logger.log(`[Mock] Sending Password Reset Email to ${email} with token: ${token}`);
    }
}
