import { Module } from '@nestjs/common';
import { QuotasService } from './quotas.service';
import { QuotasController } from './quotas.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    imports: [AuditLogsModule],
    providers: [QuotasService],
    controllers: [QuotasController],
    exports: [QuotasService]
})
export class QuotasModule { }
