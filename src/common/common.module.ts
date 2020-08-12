import { Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';

import { FirebaseService } from './services/firebase.service';
import { IPLocationService } from './services/iplocation.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [DbModule],
  providers: [FirebaseService, IPLocationService, NotificationService],
  exports: [FirebaseService, IPLocationService, NotificationService],
})
export class CommonModule {}
