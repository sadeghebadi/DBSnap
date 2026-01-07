import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from '../database/database.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [DatabaseModule, PrismaModule],
    controllers: [JobsController],
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule { }
