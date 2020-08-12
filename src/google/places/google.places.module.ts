import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { DbModule } from '../../db/db.module';
import { UsersModule } from '../../users/users.module';
import { GoogleModule } from '../google.module';

import { GooglePlacesController } from './google.places.controller';
import { GooglePlacesService } from './google.places.service';

@Module({
  imports: [CommonModule, DbModule, GoogleModule, UsersModule],
  controllers: [GooglePlacesController],
  providers: [GooglePlacesService],
})
export class GooglePlacesModule {}
