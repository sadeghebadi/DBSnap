import { Module } from '@nestjs/common';
import { ConnectionsService } from './connections.service.js';
import { ConnectionsController } from './connections.controller.js';
import { DatabaseModule } from '../database/database.module.js';

import { ConnectionValidatorService } from './connection-validator.service.js';
import { SshTunnelService } from './ssh-tunnel.service.js';

@Module({
    imports: [DatabaseModule],
    controllers: [ConnectionsController],
    providers: [ConnectionsService, ConnectionValidatorService, SshTunnelService],
    exports: [ConnectionsService, ConnectionValidatorService, SshTunnelService],
})
export class ConnectionsModule { }
