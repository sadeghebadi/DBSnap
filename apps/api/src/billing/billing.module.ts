import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodesController } from './promo-codes.controller';

@Module({
    imports: [PrismaModule],
    providers: [BillingService, PromoCodesService],
    controllers: [BillingController, PromoCodesController],
    exports: [BillingService, PromoCodesService],
})
export class BillingModule { }
