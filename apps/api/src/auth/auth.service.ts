import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

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

    async login(user: { email: string }) {
        const dbUser = await this.prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (dbUser.mfaEnabled) {
            return {
                mfaRequired: true,
                userId: dbUser.id,
            };
        }

        return this.generateTokens(dbUser);
    }

    private generateTokens(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role, isVerified: user.isVerified };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }

    async generateMfaSecret(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 'DBSnap', secret);
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

        await this.prisma.user.update({
            where: { id: userId },
            data: { mfaSecret: secret },
        });

        return { secret, qrCodeDataUrl };
    }

    async enableMfa(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.mfaSecret) {
            throw new BadRequestException('MFA not initialized or user not found');
        }

        const isValid = authenticator.verify({
            token: code,
            secret: user.mfaSecret,
        });

        if (!isValid) {
            throw new BadRequestException('Invalid MFA code');
        }

        // Generate 10 backup recovery codes
        const recoveryCodes = Array.from({ length: 10 }, () => randomBytes(5).toString('hex'));

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                mfaEnabled: true,
                mfaRecoveryCodes: recoveryCodes,
            },
        });

        return { recoveryCodes };
    }

    async disableMfa(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                mfaEnabled: false,
                mfaSecret: null,
                mfaRecoveryCodes: [],
            },
        });
        return { message: 'MFA disabled successfully' };
    }

    async completeMfaLogin(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.mfaEnabled) {
            throw new UnauthorizedException('MFA not enabled or user not found');
        }

        const isTotpValid = authenticator.verify({
            token: code,
            secret: user.mfaSecret!,
        });

        let isRecoveryCodeValid = false;
        if (!isTotpValid) {
            const codeIndex = user.mfaRecoveryCodes.indexOf(code);
            if (codeIndex !== -1) {
                isRecoveryCodeValid = true;
                // Remove used recovery code
                const updatedCodes = [...user.mfaRecoveryCodes];
                updatedCodes.splice(codeIndex, 1);
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { mfaRecoveryCodes: updatedCodes },
                });
            }
        }

        if (!isTotpValid && !isRecoveryCodeValid) {
            throw new UnauthorizedException('Invalid MFA code or recovery code');
        }

        return this.generateTokens(user);
    }

    async refreshToken(user: any) {
        const payload = { email: user.email, sub: user.userId, role: user.role, isVerified: user.isVerified };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async validateOAuthUser(profile: { email: string; githubId?: string; googleId?: string; displayName?: string }) {
        let user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: profile.email },
                    { githubId: profile.githubId },
                    { googleId: profile.googleId },
                ].filter(condition => Object.values(condition)[0] !== undefined)
            },
        });

        if (user) {
            // Update OAuth IDs if they are missing
            const updateData: any = {};
            if (profile.githubId && !user.githubId) updateData.githubId = profile.githubId;
            if (profile.googleId && !user.googleId) updateData.googleId = profile.googleId;

            if (Object.keys(updateData).length > 0) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: updateData,
                });
            }
        } else {
            // Create new user
            user = await this.prisma.user.create({
                data: {
                    email: profile.email,
                    passwordHash: 'OAUTH_USER', // Placeholder since they login via OAuth
                    isVerified: true, // OAuth emails are usually verified
                    githubId: profile.githubId,
                    googleId: profile.googleId,
                },
            });
        }

        return user;
    }
}
