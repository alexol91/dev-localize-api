import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { DbModule } from '../../db/db.module';

import { UserAlertController } from './user-alert.controller';

@Module({
  imports: [
    CommonModule,
    DbModule,
  ],
  controllers: [UserAlertController],
})
export class UserAlertModule {}
