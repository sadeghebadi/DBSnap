import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TelemetryService } from './telemetry.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AnalyticsController],
    providers: [AnalyticsService, TelemetryService],
})
export class AnalyticsModule { }
