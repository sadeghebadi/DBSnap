import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth/api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
    constructor(private apiKeysService: ApiKeysService) { }

    @Post()
    async createApiKey(@Request() req: any, @Body() body: { name: string; scopes?: string[] }) {
        const key = await this.apiKeysService.createApiKey(req.user.userId, body.name, body.scopes);
        return { key }; // Shown only once
    }

    @Get()
    async listApiKeys(@Request() req: any) {
        return this.apiKeysService.listApiKeys(req.user.userId);
    }

    @Delete(':id')
    async revokeApiKey(@Request() req: any, @Param('id') id: string) {
        await this.apiKeysService.revokeApiKey(req.user.userId, id);
        return { message: 'API Key revoked' };
    }
}
