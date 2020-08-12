import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AlertsModule } from './alerts/alerts.module';
import { DeviceSettingsModule } from './device-settings/device-settings.module';
import { GooglePlacesModule } from './google/places/google.places.module';
import { GroupsModule } from './groups/groups.module';
import { LocationsModule } from './locations/locations.module';
import { PlacesModule } from './places/places.module';
import { RoutesModule } from './routes/routes.module';
import { ScheduleModule } from './schedule/schedule.module';
import { UserAppsModule } from './user-apps/user-apps.module';
import { UsersModule } from './users/users.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGODB_URI }),
    }),

    AlertsModule,
    DeviceSettingsModule,
    GooglePlacesModule,
    GroupsModule,
    LocationsModule,
    PlacesModule,
    RoutesModule,
    ScheduleModule,
    UserAppsModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
