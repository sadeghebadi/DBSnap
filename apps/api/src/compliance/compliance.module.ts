
import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { PrismaModule } from '@dbsnap/database';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { BullModule } from '@nestjs/bullmq';
import { COMPLIANCE_QUEUE } from '../queues/queue.constants';

@Module({
    imports: [
        PrismaModule,
        AuditLogsModule,
        BullModule.registerQueue({
            name: COMPLIANCE_QUEUE,
        }),
    ],
    controllers: [ComplianceController],
    providers: [ComplianceService],
    exports: [ComplianceService],
})
export class ComplianceModule { }
