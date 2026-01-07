import { Module } from '@nestjs/common';
import { BackupsController } from './backups.controller';
import { BackupsService } from './backups.service';
import { DatabaseModule } from '../database/database.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { PrismaClient } from '@dbsnap/database';

@Module({
    imports: [DatabaseModule, EncryptionModule],
    controllers: [BackupsController],
    providers: [
        BackupsService,
        {
            provide: PrismaClient,
            useClass: PrismaClient
        }
    ],
})
export class BackupsModule { }
