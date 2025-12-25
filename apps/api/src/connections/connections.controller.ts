import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ConnectionValidatorService, ConnectionDetails } from './connection-validator.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';

@Controller('connections')
@UseGuards(JwtAuthGuard, VerifiedGuard)
export class ConnectionsController {
    constructor(private readonly validatorService: ConnectionValidatorService) { }

    @Post('test')
    async testConnection(@Body() details: ConnectionDetails) {
        try {
            return await this.validatorService.validate(details);
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }
    }
}
