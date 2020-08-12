import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from 'nest-schedule';

import { DbModule } from '../db/db.module';

import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    NestScheduleModule.register(),
    DbModule,
  ],
  providers: [ScheduleService],
})
export class ScheduleModule {}
