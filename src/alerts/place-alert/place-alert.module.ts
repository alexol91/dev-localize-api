import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { DbModule } from '../../db/db.module';

import { PlaceAlertController } from './place-alert.controller';

@Module({
  imports: [
    CommonModule,
    DbModule,
  ],
  controllers: [PlaceAlertController],
})
export class PlaceAlertModule {}
