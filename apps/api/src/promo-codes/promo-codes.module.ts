import { Module } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service.js';
import { PromoCodesController } from './promo-codes.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
    imports: [DatabaseModule],
    controllers: [PromoCodesController],
    providers: [PromoCodesService],
    exports: [PromoCodesService],
})
export class PromoCodesModule { }
