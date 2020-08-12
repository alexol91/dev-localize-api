import { Module } from '@nestjs/common';

import { PlaceAlertModule } from './place-alert/place-alert.module';
import { UserAlertModule } from './user-alert/user-alert.module';

@Module({
  imports: [PlaceAlertModule, UserAlertModule],
})
export class AlertsModule {}
