import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async signup(data: { email: string; passwordHash: string }) {
        const verificationToken = randomBytes(32).toString('hex');
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                verificationToken,
            },
        });

        await this.mailService.sendVerificationEmail(user.email, verificationToken);
        return { message: 'Signup successful, please check your email for verification.' };
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
            },
        });

        return { message: 'Email verified successfully.' };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // we don't want to leak if a user exists or not, but for MVP it's often okay or we return success anyway
            return { message: 'If an account with that email exists, a password reset link has been sent.' };
        }

        const resetToken = randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour expiry

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: expires,
            },
        });

        await this.mailService.sendPasswordResetEmail(user.email, resetToken);
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    async resetPassword(token: string, newPasswordHash: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: { gt: new Date() },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: newPasswordHash,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        return { message: 'Password reset successful.' };
    }

    async login(user: any) {
        const dbUser = await this.prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: dbUser.email, sub: dbUser.id, role: dbUser.role, isVerified: dbUser.isVerified };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }

    async refreshToken(user: any) {
        const payload = { email: user.email, sub: user.userId, role: user.role, isVerified: user.isVerified };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
