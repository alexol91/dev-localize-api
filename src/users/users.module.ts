import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { DbModule } from '../db/db.module';

import { UsersController } from './users.controller';

@Module({
  imports: [
    CommonModule,
    DbModule,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
