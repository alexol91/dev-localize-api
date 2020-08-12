import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { DbModule } from '../db/db.module';

import { DeviceSettingsController } from './device-settings.controller';

@Module({
  imports: [
    CommonModule,
    DbModule,
  ],
  controllers: [DeviceSettingsController],
})
export class DeviceSettingsModule {}
