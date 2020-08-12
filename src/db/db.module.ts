import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DeviceSettingsService } from './services/device.settings.service';
import { GroupCodeService } from './services/groupcode.service';
import { GroupsService } from './services/groups.service';
import { LocationsService } from './services/locations.service';
import { MembershipService } from './services/membership.service';
import { PlaceAlertService } from './services/place.alert.service';
import { PlacesService } from './services/places.service';
import { UserAlertService } from './services/user.alert.service';
import { UserAppService } from './services/user.app.service';
import { UsersService } from './services/users.service';

import { DeviceSettingsSchema } from './schemas/device.settings.schema';
import { GroupCodeSchema } from './schemas/group.code.schema';
import { GroupSchema } from './schemas/group.schema';
import { LocationSchema } from './schemas/location.schema';
import { MembershipSchema } from './schemas/membership.schema';
import { PlaceAlertSchema } from './schemas/place.alert.schema';
import { PlaceSchema } from './schemas/place.schema';
import { UserAlertSchema } from './schemas/user.alert.schema';
import { UserAppSchema } from './schemas/user.app.schema';
import { UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DeviceSettings', schema: DeviceSettingsSchema },
      { name: 'GroupCode', schema: GroupCodeSchema },
      { name: 'Group', schema: GroupSchema },
      { name: 'Location', schema: LocationSchema },
      { name: 'Membership', schema: MembershipSchema },
      { name: 'PlaceAlert', schema: PlaceAlertSchema },
      { name: 'Place', schema: PlaceSchema },
      { name: 'UserAlert', schema: UserAlertSchema },
      { name: 'UserApp', schema: UserAppSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [
    DeviceSettingsService,
    GroupCodeService,
    GroupsService,
    LocationsService,
    MembershipService,
    PlaceAlertService,
    PlacesService,
    UserAlertService,
    UserAppService,
    UsersService,
  ],
  exports: [
    DeviceSettingsService,
    GroupCodeService,
    GroupsService,
    LocationsService,
    MembershipService,
    PlaceAlertService,
    PlacesService,
    UserAlertService,
    UserAppService,
    UsersService,
  ],
})
export class DbModule {}
