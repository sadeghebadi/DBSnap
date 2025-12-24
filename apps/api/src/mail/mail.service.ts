import { Injectable } from '@nestjs/common';
import { createLogger } from '@dbsnap/shared';

const logger = createLogger('mail-service');

@Injectable()
export class MailService {
    async sendVerificationEmail(email: string, token: string) {
        logger.info(`Sending verification email to ${email} with token ${token}`);
        // In a real app, use Nodemailer, SendGrid, etc.
        const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`;
        logger.info(`Verification URL: ${verificationUrl}`);
    }

    async sendPasswordResetEmail(email: string, token: string) {
        logger.info(`Sending password reset email to ${email} with token ${token}`);
        const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;
        logger.info(`Reset URL: ${resetUrl}`);
    }
}
