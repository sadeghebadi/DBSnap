import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { EncryptionModule } from '../encryption/encryption.module';
import { DatabaseModule } from '../database/database.module';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';

@Module({
    imports: [PrismaModule, EncryptionModule, DatabaseModule],
    controllers: [ProjectsController, ConnectionsController],
    providers: [ProjectsService, ConnectionsService],
})
export class ProjectsModule { }
