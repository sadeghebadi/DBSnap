import { Module } from '@nestjs/common';
import { WorkerMonitorService } from './worker-monitor.service';

@Module({
    providers: [WorkerMonitorService],
    exports: [WorkerMonitorService],
})
export class MonitorModule { }
