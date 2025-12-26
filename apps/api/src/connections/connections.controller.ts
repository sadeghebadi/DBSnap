import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ConnectionsService } from './connections.service.js';
import { CreateConnectionDto } from './dto/create-connection.dto.js';
import { UpdateConnectionDto } from './dto/update-connection.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';

import { ConnectionValidatorService } from './connection-validator.service.js';

@Controller('connections')
@UseGuards(JwtAuthGuard, VerifiedGuard)
export class ConnectionsController {
    constructor(
        private readonly connectionsService: ConnectionsService,
        private readonly validatorService: ConnectionValidatorService,
    ) { }

    @Post()
    async create(@Req() req: { user: { userId: string } }, @Body() dto: CreateConnectionDto) {
        return this.connectionsService.create(req.user.userId, dto);
    }

    @Get()
    async findAll(@Req() req: { user: { userId: string } }, @Query('projectId') projectId?: string) {
        return this.connectionsService.findAll(req.user.userId, projectId);
    }

    @Get(':id')
    async findOne(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
        return this.connectionsService.findOne(req.user.userId, id);
    }

    @Patch(':id')
    async update(@Req() req: { user: { userId: string } }, @Param('id') id: string, @Body() dto: UpdateConnectionDto) {
        return this.connectionsService.update(req.user.userId, id, dto);
    }

    @Post('test')
    async testConnection(@Body() dto: CreateConnectionDto) {
        return this.validatorService.validate(dto);
    }

    @Post(':id/test')
    async testExistingConnection(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
        const connection = await this.connectionsService.findOne(req.user.userId, id);
        return this.validatorService.validate({
            ...connection,
            type: connection.type as any, // Cast to validator's DatabaseType
        });
    }

    @Delete(':id')
    async remove(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
        return this.connectionsService.remove(req.user.userId, id);
    }
}
