
import { Module } from '@nestjs/common';
import { ConnectionValidatorService } from './connection-validator.service';

@Module({
    providers: [ConnectionValidatorService],
    exports: [ConnectionValidatorService],
})
export class DatabaseModule { }
