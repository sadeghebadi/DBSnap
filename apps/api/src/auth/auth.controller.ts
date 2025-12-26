import { Controller, Post, Body, UseGuards, Req, Get, Query, Delete, Param } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { VerifiedGuard } from './guards/verified.guard.js';
import { UserRole } from '@dbsnap/shared';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body() body: { email: string; passwordHash: string }) {
        return this.authService.signup(body);
    }

    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; newPasswordHash: string }) {
        return this.authService.resetPassword(body.token, body.newPasswordHash);
    }

    @Post('login')
    async login(@Body() body: { email: string; passwordHash: string }, @Req() req: Request) {
        const xForwardedFor = req.headers['x-forwarded-for'];
        const ip = req.ip || (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor);
        const userAgent = req.headers['user-agent'] as string;
        return this.authService.login(body, { ip, userAgent });
    }

    @Get('sessions')
    @UseGuards(JwtAuthGuard)
    async listSessions(@Req() req: Request & { user: { userId: string } }) {
        return this.authService.listSessions(req.user.userId);
    }

    @Delete('sessions/:id')
    @UseGuards(JwtAuthGuard)
    async revokeSession(@Req() req: Request & { user: { userId: string } }, @Param('id') id: string) {
        return this.authService.revokeSession(id, req.user.userId);
    }

    @Delete('sessions')
    @UseGuards(JwtAuthGuard)
    async revokeAllSessions(@Req() req: Request & { user: { userId: string } }) {
        return this.authService.revokeAllSessions(req.user.userId);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout() {
        return { message: 'Logged out successfully' };
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    async refresh(@Req() req: Request & { user: { email: string; userId: string; role: string; isVerified: boolean } }) {
        return this.authService.refreshToken(req.user);
    }

    @Get('admin-only')
    @UseGuards(JwtAuthGuard, RolesGuard, VerifiedGuard)
    @Roles(UserRole.ADMIN)
    async adminOnly() {
        return { message: 'Welcome, Admin!' };
    }

    @Post('mfa/generate')
    @UseGuards(JwtAuthGuard)
    async generateMfaSecret(@Req() req: Request & { user: { userId: string } }) {
        return this.authService.generateMfaSecret(req.user.userId);
    }

    @Post('mfa/enable')
    @UseGuards(JwtAuthGuard)
    async enableMfa(@Req() req: Request & { user: { userId: string } }, @Body('code') code: string) {
        return this.authService.enableMfa(req.user.userId, code);
    }

    @Post('mfa/disable')
    @UseGuards(JwtAuthGuard)
    async disableMfa(@Req() req: Request & { user: { userId: string } }) {
        return this.authService.disableMfa(req.user.userId);
    }

    @Post('mfa/login')
    async completeMfaLogin(@Body('userId') userId: string, @Body('code') code: string) {
        return this.authService.completeMfaLogin(userId, code);
    }

    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubLogin() {
        // Initiates the GitHub OAuth flow
    }

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubLoginCallback(@Req() req: Request & { user: { email: string; id: string; role: string; isVerified: boolean } }) {
        return this.authService.login(req.user);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleLogin() {
        // Initiates the Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleLoginCallback(@Req() req: Request & { user: { email: string; id: string; role: string; isVerified: boolean } }) {
        return this.authService.login(req.user);
    }
}
