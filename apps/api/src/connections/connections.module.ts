import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller.js';
import { ConnectionValidatorService } from './connection-validator.service.js';

@Module({
    controllers: [ConnectionsController],
    providers: [ConnectionValidatorService],
    exports: [ConnectionValidatorService],
})
export class ConnectionsModule { }
