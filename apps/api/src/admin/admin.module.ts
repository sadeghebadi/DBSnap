import { Module } from '@nestjs/common';
import { SuspensionController } from './suspension.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [PrismaModule, AuditLogsModule, EmailModule],
    controllers: [SuspensionController],
})
export class AdminModule { }
