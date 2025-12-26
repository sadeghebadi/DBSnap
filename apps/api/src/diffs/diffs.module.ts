import { Module } from '@nestjs/common';
import { DiffsService } from './diffs.service.js';
import { DiffsController } from './diffs.controller.js';

@Module({
    controllers: [DiffsController],
    providers: [DiffsService],
})
export class DiffsModule { }
