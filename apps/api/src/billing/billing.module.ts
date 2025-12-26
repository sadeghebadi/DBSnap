import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service.js';
import { BillingService } from './billing.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
    imports: [DatabaseModule],
    providers: [StripeService, BillingService],
    exports: [StripeService, BillingService],
})
export class BillingModule { }
