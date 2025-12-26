import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
    imports: [DatabaseModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
