import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { VerifiedGuard } from '../auth/guards/verified.guard.js';

import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        // BullModule.registerQueue({
        //     name: 'backups',
        // }), // Disabled - causes startup hang
    ],
    controllers: [AdminController],
    providers: [AdminService, RolesGuard, VerifiedGuard],
})
export class AdminModule { }
