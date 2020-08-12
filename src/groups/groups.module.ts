import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { DbModule } from '../db/db.module';
import { UsersModule } from '../users/users.module';

import { GroupsController } from './groups.controller';

@Module({
  imports: [
    CommonModule,
    DbModule,
    UsersModule,
  ],
  controllers: [GroupsController],
})
export class GroupsModule {}
