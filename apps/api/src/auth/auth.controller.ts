import { Controller, Request, Post, UseGuards, Get, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req: any) {
        return this.authService.login(req.user, req.ip, req.headers['user-agent']);
    }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body.email, body.password);
    }

    @Get('verify')
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Post('password-reset-request')
    async requestPasswordReset(@Body() body: any) {
        return this.authService.requestPasswordReset(body.email);
    }

    @Post('password-reset')
    async resetPassword(@Body() body: any) {
        return this.authService.resetPassword(body.token, body.password);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Request() req: any) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Request() req: any) {
        return this.authService.login(req.user, req.ip, req.headers['user-agent']);
    }

    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubAuth(@Request() req: any) { }

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubAuthRedirect(@Request() req: any) {
        return this.authService.login(req.user, req.ip, req.headers['user-agent']);
    }

    @UseGuards(JwtAuthGuard)
    @Post('mfa/setup')
    async mfaSetup(@Request() req: any) {
        const { secret, otpauthUrl } = await this.authService.generateMfaSecret(req.user);
        const qrCodeUrl = await this.authService.generateMfaQrCode(otpauthUrl);
        return { secret, qrCodeUrl };
    }

    @UseGuards(JwtAuthGuard)
    @Post('mfa/enable')
    async mfaEnable(@Request() req: any, @Body() body: { token: string; secret: string }) {
        return this.authService.enableMfa(req.user.userId /* userId from jwt */, body.secret, body.token);
    }

    @Post('mfa/login')
    async mfaLogin(@Request() req: any, @Body() body: { email: string; token: string }) {
        return this.authService.loginMfaByEmail(body.email, body.token, req.ip, req.headers['user-agent']);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req: any) {
        if (req.user.sessionId) {
            await this.authService.logout(req.user.sessionId);
        }
        return { message: 'Logged out successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    async logoutAll(@Request() req: any) {
        await this.authService.logoutAll(req.user.userId);
        return { message: 'Logged out from all devices' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('sessions')
    async getSessions(@Request() req: any) {
        return this.authService.getSessions(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
