import { Module } from '@nestjs/common';
import { SnapshotsService } from './snapshots.service.js';
import { SnapshotsController } from './snapshots.controller.js';

@Module({
    controllers: [SnapshotsController],
    providers: [SnapshotsService],
})
export class SnapshotsModule { }
