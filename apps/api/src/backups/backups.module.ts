import { Module } from '@nestjs/common';
import { BackupsController } from './backups.controller.js';
import { BackupsService } from './backups.service.js';
import { ApiKeysModule } from '../api-keys/api-keys.module.js';

@Module({
    imports: [ApiKeysModule],
    controllers: [BackupsController],
    providers: [BackupsService],
})
export class BackupsModule { }
