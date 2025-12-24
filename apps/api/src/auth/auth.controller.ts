import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { UserRole } from '@dbsnap/shared';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        // In a real app, validate credentials here. For MVP, we'll return a token for any email.
        const role = body.role || UserRole.MEMBER;
        return this.authService.login({ email: body.email, id: 'dummy-id', role });
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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async adminOnly() {
        return { message: 'Welcome, Admin!' };
    }
}
