import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiImplicitBody, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { NotificationService } from '../common/services/notification.service';
import { GroupsService } from '../db/services/groups.service';
import { LocationsService } from '../db/services/locations.service';

import { FirebaseProfile } from '../common/decorators/user.firebaseProfile.decorator';
import { UserId } from '../common/decorators/user.id.decorator';
import { FirebaseTokenInterceptor } from '../common/interceptors/firebase.token.interceptor';
import { LanguageInterceptor } from '../common/interceptors/language.interceptor';
import { ObjectIdPipe } from '../common/pipes/objectId.pipe';
import { AddLocationPipe } from './pipes/addLocation.pipe';

import { LocationsControllerResponse } from './models/responses/locations.api.response.model';

import { DTOAddLocation } from './dto/AddLocation.dto';

import { ILocation } from '../db/interfaces/location.interface';
import { Location } from '../db/models/location.model';

const validatePipeOptions = { transform: true, whitelist: true, forbidNonWhitelisted: true };

export const ERRORS = {
  NOFIREBASEACCOUNT: new BadRequestException('This user has no Firebase account.'),
};

@Controller('user/locations')
@UseInterceptors(FirebaseTokenInterceptor, LanguageInterceptor)
export class LocationsController {
  constructor(
    private groupsService: GroupsService,
    private locationsService: LocationsService,
    private notificationService: NotificationService,
  ) { }

  @Post('/add')
  @ApiBearerAuth()
  @ApiImplicitBody({name: 'Locations', type: DTOAddLocation, isArray: true})
  @ApiResponse({ status: 201, type: LocationsControllerResponse, description: 'Returns location'})
  async addLocations(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @FirebaseProfile() userProfile: any,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOAddLocation[] | DTOAddLocation,
  ) {
    try {
      const newLocations = new AddLocationPipe(userId).transform(dto);
      const locations = await this.locationsService.addLocations(userId, newLocations);
      const notifications = await this.getVisitNotifications(userId, userProfile, locations);
      notifications.forEach((n) => this.notificationService.sendNotification(n.tokens, n.notification));
      return this.responseWithLocations(locations);
    } catch (error) { throw error; }
  }

  private async getVisitNotifications(userId: ObjectId, userProfile: any, locations: ILocation[]) {
    const latestLocation = await this.locationsService.getLatestLocation(userId);
    const groupsWithPlaces = await this.groupsService.getAllGroupsWithPlaces(userId);

    const groupsWithNotifications = groupsWithPlaces
      .map((group) => {
        const entered = group.places.filter((p) => p.enteredAt && !p.leftAt && p.enteredAt.id === latestLocation.id);
        const left = group.places.filter((p) => p.leftAt)
          .sort((a, b) => new Date(a.leftAt.timestamp).getTime() - new Date(b.leftAt.timestamp).getTime());

        if (entered.length > 0) {
          return { group, state: 'entered', place: entered[0] };
        } else if (left.length > 0) {
          const lastPlaceLeft = left[left.length - 1];
          const leftNow = locations.some((l) => l.id === lastPlaceLeft.leftAt.id);
          if (leftNow) { return { group, state: 'left', place: lastPlaceLeft }; }
        }
        return undefined;
      })
    .filter((n) => n !== undefined);

    if (groupsWithNotifications.length > 0) {
      const alerteeId = userId.toHexString();
      const notifications = groupsWithNotifications.reduce((acc, gwn) => {
        const usersToNotify = gwn.group.users.filter((u) => u.id !== alerteeId && (u.alert === undefined || u.alert.enabled))
          .filter((u) => {
            const alert = gwn.place.alerts.find((a) => a.userId.toString() === u.id);
            return !alert || alert.enabled;
          });

        if (usersToNotify.length > 0) {
          const tokens =  usersToNotify.reduce((uacc, u) => uacc.concat(u.apps.map((a) => ({token: a.registrationToken, userId: new ObjectId(u.id)}))), [])
            .filter((t) => t.token !== undefined);
          if (tokens.length > 0) {
            acc.push({
              tokens,
              notification: {
                title: 'Alert',
                body: `User ${userProfile.name} ${gwn.state} ${gwn.place.name}.`,
                clickAction: `PLACE_VISIT`,
              },
            });
          }
        }

        return acc;
      }, []);

      return notifications;
    } else {
      return [];
    }
  }

  private async responseWithLocations(locations: ILocation[]): Promise<LocationsControllerResponse> {
    return new LocationsControllerResponse(locations.map((l) => {
      const location = new Location(l);
      location.userId = l.user.uid;
      return location;
    }));
  }
}
