import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { DbModule } from '../db/db.module';
import { UsersModule } from '../users/users.module';

import { PlacesController } from './places.controller';

@Module({
  imports: [
    CommonModule,
    DbModule,
    UsersModule,
  ],
  controllers: [PlacesController],
})
export class PlacesModule {}
