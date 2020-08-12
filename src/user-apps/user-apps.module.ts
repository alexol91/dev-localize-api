import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { DbModule } from '../db/db.module';

import { UserAppsController } from './user-apps.controller';

@Module({
  imports: [
    CommonModule,
    DbModule,
  ],
  controllers: [UserAppsController],
})
export class UserAppsModule {}
