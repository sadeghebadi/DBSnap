import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [EmailModule],
    providers: [AnalysisService],
    exports: [AnalysisService],
})
export class AnalysisModule { }
