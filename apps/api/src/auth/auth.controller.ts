import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        // In a real app, validate credentials here. For MVP, we'll return a token for any email.
        return this.authService.login({ email: body.email, id: 'dummy-id' });
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

    @Post('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any) {
        return req.user;
    }
}
