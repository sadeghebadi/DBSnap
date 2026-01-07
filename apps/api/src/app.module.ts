import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';

import { ProjectsModule } from './projects/projects.module';
import { DatabaseModule } from './database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { SchedulerModule } from './scheduler/scheduler.module';
import { BackupsModule } from './backups/backups.module';
import { DiffsModule } from './diffs/diffs.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        autoLogging: true,
        serializers: {
          req: (req: any) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
        },
      },
    }),
    UsersModule,
    AuthModule,
    EmailModule,
    ProjectsModule,
    ProjectsModule,
    DatabaseModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    SchedulerModule,
    BackupsModule,
    DiffsModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
