import { Module, Global } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';

@Global()
@Module({
    providers: [MaintenanceService],
    controllers: [MaintenanceController],
    exports: [MaintenanceService],
})
export class MaintenanceModule { }
