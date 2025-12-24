import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
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
    async signup(@Body() body: any) {
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
    async resetPassword(@Body() body: any) {
        return this.authService.resetPassword(body.token, body.newPasswordHash);
    }

    @Post('login')
    async login(@Body() body: any) {
        return this.authService.login(body);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout() {
        return { message: 'Logged out successfully' };
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    async refresh(@Req() req: any) {
        return this.authService.refreshToken(req.user);
    }

    @Get('admin-only')
    @UseGuards(JwtAuthGuard, RolesGuard, VerifiedGuard)
    @Roles(UserRole.ADMIN)
    async adminOnly() {
        return { message: 'Welcome, Admin!' };
    }
}
