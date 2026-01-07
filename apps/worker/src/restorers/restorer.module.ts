import { Module } from '@nestjs/common';
import { RestorerFactory } from './restorer.factory';

@Module({
    providers: [RestorerFactory],
    exports: [RestorerFactory],
})
export class RestorerModule { }
