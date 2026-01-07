import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';
import { MfaService } from './mfa.service';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
        private prisma: PrismaService,
        private mfaService: MfaService,
        private sessionsService: SessionsService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && user.passwordHash && await bcrypt.compare(pass, user.passwordHash)) {
            if (!user.isVerified) {
                throw new BadRequestException('Email not verified');
            }
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any, ipAddress?: string, userAgent?: string) {
        if (user.mfaEnabled) {
            return { mfaRequired: true };
        }

        const sessionId = await this.sessionsService.createSession(user.id, ipAddress, userAgent);

        const payload = { email: user.email, sub: user.id, sid: sessionId, role: user.role?.name };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(email: string, pass: string) {
        const existing = await this.usersService.findOne(email);
        if (existing) {
            throw new BadRequestException('User already exists');
        }

        const passwordHash = await bcrypt.hash(pass, 10);
        const verificationToken = randomBytes(32).toString('hex');

        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                verificationToken,
            },
        });

        await this.emailService.sendVerificationEmail(email, verificationToken);
        return { message: 'Registration successful. Check your email to verify.' };
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({ where: { verificationToken: token } });
        if (!user) throw new BadRequestException('Invalid token');

        await this.prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, verificationToken: null },
        });

        return { message: 'Email verified successfully. You can now login.' };
    }

    async requestPasswordReset(email: string) {
        const user = await this.usersService.findOne(email);
        if (!user) return { message: 'If user exists, email sent.' }; // Security: don't reveal existence

        const resetToken = randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpires },
        });

        await this.emailService.sendPasswordResetEmail(email, resetToken);
        return { message: 'If user exists, email sent.' };
    }

    async resetPassword(token: string, newPass: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: { gt: new Date() },
            },
        });

        if (!user) throw new BadRequestException('Invalid or expired token');

        const passwordHash = await bcrypt.hash(newPass, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpires: null,
            },
        });

        return { message: 'Password reset successful.' };
    }

    async validateOAuthUser(details: { provider: 'GOOGLE' | 'GITHUB'; providerId: string; email: string; name?: string }) {
        if (!details.email) throw new BadRequestException('Email not provided by OAuth provider.');

        const existingUser = await this.prisma.user.findUnique({
            where: { email: details.email },
        });

        if (existingUser) {
            // If user exists but no provider, link it or just return user
            // Ideally we should check if existingUser.provider matches or we allow merging.
            // For MVP, if email matches, we log them in. 
            // Optional: Update providerId if missing.
            if (!existingUser.providerId) {
                await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { provider: details.provider, providerId: details.providerId, isVerified: true }
                });
            }
            return existingUser;
        }

        // Create new user
        const user = await this.prisma.user.create({
            data: {
                email: details.email,
                provider: details.provider,
                providerId: details.providerId,
                isVerified: true, // OAuth emails are verified
                passwordHash: null // No password
            },
        });

        return user;
    }

    async generateMfaSecret(user: any) {
        const { secret, otpauthUrl } = await this.mfaService.generateSecret(user.email);
        return { secret, otpauthUrl };
    }

    async generateMfaQrCode(otpauthUrl: string) {
        return this.mfaService.generateQrCode(otpauthUrl);
    }

    async enableMfa(userId: string, secret: string, token: string) {
        const isValid = this.mfaService.verifyToken(token, secret);
        if (!isValid) throw new BadRequestException('Invalid token');

        await this.prisma.user.update({
            where: { id: userId },
            data: { mfaSecret: secret, mfaEnabled: true },
        });

        return { message: 'MFA enabled successfully' };
    }

    async loginMfa(user: any, token: string, ipAddress?: string, userAgent?: string) {
        if (!user.mfaEnabled || !user.mfaSecret) {
            throw new BadRequestException('MFA not enabled for user');
        }

        const isValid = this.mfaService.verifyToken(token, user.mfaSecret);
        if (!isValid) throw new BadRequestException('Invalid MFA token');

        const sessionId = await this.sessionsService.createSession(user.id, ipAddress, userAgent);

        const payload = { email: user.email, sub: user.id, sid: sessionId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async loginMfaByEmail(email: string, token: string, ipAddress?: string, userAgent?: string) {
        const user = await this.usersService.findOne(email);
        if (!user) throw new BadRequestException('Invalid credentials');
        return this.loginMfa(user, token, ipAddress, userAgent);
    }

    async logout(sessionId: string) {
        return this.sessionsService.invalidateSession(sessionId);
    }

    async logoutAll(userId: string) {
        return this.sessionsService.invalidateAllUserSessions(userId);
    }

    async getSessions(userId: string) {
        return this.sessionsService.getActiveSessions(userId);
    }

    async impersonate(adminId: string, userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user) throw new NotFoundException('User not found');

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role?.name,
            impersonatorId: adminId
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
