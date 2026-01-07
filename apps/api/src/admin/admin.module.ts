import { Module } from '@nestjs/common';
import { SuspensionController } from './suspension.controller';
import { AdminSupportController } from './admin-support.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { EmailModule } from '../email/email.module';
import { ProjectsModule } from '../projects/projects.module';
import { BackupsModule } from '../backups/backups.module';

@Module({
    imports: [PrismaModule, AuditLogsModule, EmailModule, ProjectsModule, BackupsModule],
    controllers: [SuspensionController, AdminSupportController],
})
export class AdminModule { }
