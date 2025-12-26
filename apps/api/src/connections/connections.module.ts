import { Module } from '@nestjs/common';
import { ConnectionsService } from './connections.service.js';
import { ConnectionsController } from './connections.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
    imports: [DatabaseModule],
    controllers: [ConnectionsController],
    providers: [ConnectionsService],
    exports: [ConnectionsService],
})
export class ConnectionsModule { }
