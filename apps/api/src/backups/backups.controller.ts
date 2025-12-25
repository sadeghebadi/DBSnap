import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key.guard.js';
import { Scopes } from '../auth/decorators/scopes.decorator.js';

@Controller('backups')
export class BackupsController {
    @Post('trigger')
    @UseGuards(ApiKeyGuard)
    @Scopes('backup:run')
    trigger() {
        return {
            message: 'Backup triggered successfully via API key',
            timestamp: new Date().toISOString(),
        };
    }
}
