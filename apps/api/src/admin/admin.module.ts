import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { DatabaseModule } from '../database/database.module.js';

import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        DatabaseModule,
        BullModule.registerQueue({
            name: 'backups',
        }),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
