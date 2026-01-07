import { Module, Global } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Global()
@Module({
    imports: [PrismaModule, EncryptionModule],
    providers: [AuditLogsService],
    controllers: [AuditLogsController],
    exports: [AuditLogsService],
})
export class AuditLogsModule { }
