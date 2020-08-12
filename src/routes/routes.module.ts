import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { DbModule } from '../db/db.module';

import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  imports: [
    CommonModule,
    DbModule,
  ],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
