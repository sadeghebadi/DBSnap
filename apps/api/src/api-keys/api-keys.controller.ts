import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
    constructor(private apiKeysService: ApiKeysService) { }

    @Post()
    create(@Request() req, @Body() body: { name: string; scopes: string[] }) {
        return this.apiKeysService.create(req.user.id, body.name, body.scopes);
    }

    @Get()
    findAll(@Request() req) {
        return this.apiKeysService.findAll(req.user.id);
    }

    @Delete(':id')
    delete(@Request() req, @Param('id') id: string) {
        return this.apiKeysService.delete(req.user.id, id);
    }

    @Post(':id/rotate')
    rotate(@Request() req, @Param('id') id: string) {
        return this.apiKeysService.rotate(req.user.id, id);
    }
}
