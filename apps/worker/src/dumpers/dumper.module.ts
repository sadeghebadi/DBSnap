import { Module } from '@nestjs/common';
import { DumperFactory } from './dumper.factory';

@Module({
    providers: [DumperFactory],
    exports: [DumperFactory],
})
export class DumperModule { }
