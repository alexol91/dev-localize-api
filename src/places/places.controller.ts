import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { FirebaseService } from '../common/services/firebase.service';
import { NotificationService } from '../common/services/notification.service';
import { GroupsService } from '../db/services/groups.service';
import { LocationsService } from '../db/services/locations.service';
import { PlacesService } from '../db/services/places.service';

import { FirebaseProfile } from '../common/decorators/user.firebaseProfile.decorator';
import { UserId } from '../common/decorators/user.id.decorator';
import { FirebaseTokenInterceptor } from '../common/interceptors/firebase.token.interceptor';
import { LanguageInterceptor } from '../common/interceptors/language.interceptor';
import { ObjectIdPipe } from '../common/pipes/objectId.pipe';
import { AddPlacePipe } from './pipes/addPlace.pipe';
import { EditPlacePipe } from './pipes/editPlace.pipe';

import { ControllerResponse } from '../common/models/api.response.model';
import { PlaceControllerResponse } from './models/responses/place.api.response.model';
import { PlacesControllerResponse } from './models/responses/places.api.response.model';

import { DTOAddPlace } from './dto/AddPlace.dto';
import { DTOEditPlace } from './dto/EditPlace.dto';

import { IPlace } from '../db/interfaces/place.interface';
import { Place } from '../db/models/place.model';
import { User } from '../db/models/user.model';

const validatePipeOptions = { transform: true, whitelist: true, forbidNonWhitelisted: true };

export const ERRORS = {
  NOFIREBASEACCOUNT: new BadRequestException('Place creator has no Firebase account.'),
};

@Controller('user/groups/:groupId/places')
@UseInterceptors(FirebaseTokenInterceptor, LanguageInterceptor)
export class PlacesController {
  constructor(
    private firebaseService: FirebaseService,
    private groupsService: GroupsService,
    private locationsService: LocationsService,
    private notificationService: NotificationService,
    private placesService: PlacesService,
  ) { }

  @Get()
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: PlacesControllerResponse, description: 'Returns user places'})
  async getAllPlaces(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Param('groupId', new ObjectIdPipe()) groupId: ObjectId,
  ) {
    try {
      await this.groupsService.validateMember(userId, groupId);
      const places = await this.placesService.getAllPlaces(userId, groupId);
      return this.responseWithPlaces(places, userId);
    } catch (error) { throw error; }
  }

  @Post('/add')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: PlaceControllerResponse, description: 'Returns place'})
  async addPlace(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @FirebaseProfile() creatorProfile: any,
    @Param('groupId', new ObjectIdPipe()) groupId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOAddPlace,
  ) {
    try {
      const newPlace = new AddPlacePipe(userId, groupId).transform(dto);
      await this.groupsService.validateMember(userId, groupId);
      const place = await this.placesService.addPlace(userId, newPlace);
      this.notifyMembers(userId, groupId, new ObjectId(place.id));
      return this.responseWithPlace(place, creatorProfile, userId);
    } catch (error) { throw error; }
  }

  @Put(':id/edit')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: PlaceControllerResponse, description: 'Returns updated place'})
  async editPlace(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @FirebaseProfile() creatorProfile: any,
    @Param('groupId', new ObjectIdPipe()) groupId: ObjectId,
    @Param('id', new ObjectIdPipe()) placeId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOEditPlace,
  ) {
    try {
      const newPlace = new EditPlacePipe().transform(dto);
      await this.groupsService.validateMember(userId, groupId);
      const place = await this.placesService.editPlace(userId, groupId, placeId, newPlace);
      this.notifyMembers(userId, groupId, placeId);
      return this.responseWithPlace(place, creatorProfile, userId);
    } catch (error) { throw error; }
  }

  @Delete(':id/delete')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: ControllerResponse, description: 'Deletes place'})
  async deletePlace(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Param('groupId', new ObjectIdPipe()) groupId: ObjectId,
    @Param('id', new ObjectIdPipe()) placeId: ObjectId,
  ) {
    try {
      await this.groupsService.validateMember(userId, groupId);
      await this.placesService.deletePlace(userId, groupId, placeId);
      this.notifyMembers(userId, groupId, placeId);
      return new ControllerResponse();
    } catch (error) { throw error; }
  }

  private async notifyMembers(userId: ObjectId, groupId: ObjectId, placeId: ObjectId) {
    const alerteeId = userId.toHexString();
    const tokens = (await this.groupsService.getGroupMembersWithApps(groupId))
      .filter((user) => user.id !== alerteeId)
      .reduce((acc, u) => acc.concat(u.apps.map((a) => ({token: a.registrationToken, userId: new ObjectId(u.id)}))), []);
    if (tokens.length > 0) {
      this.notificationService.sendSilentNotification(tokens, {
        groupId: groupId.toHexString(),
        placeId: placeId.toHexString(),
        action: 'PLACE_UPDATE',
      });
    }
  }

  private async responseWithPlace(iplace: IPlace, creatorProfile: any, requestUserId: ObjectId): Promise<PlaceControllerResponse> {
    try {
      const requestUserLocation = await this.locationsService.getLatestLocation(requestUserId);

      const place = new Place(iplace, {requestUserId});
      place.creator = new User(iplace.user, {
        firebaseProfile: creatorProfile,
        samePerson: requestUserId.toHexString() === iplace.user.id,
        sameGroup: true,
        requestUserLocation,
      });
      return new PlaceControllerResponse(place);
    } catch (error) { throw error; }
  }

  private async responseWithPlaces(places: IPlace[], requestUserId: ObjectId): Promise<PlacesControllerResponse> {
    try {
      const requestUserLocation = await this.locationsService.getLatestLocation(requestUserId);

      return new PlacesControllerResponse((await Promise.all(places.map(async (p) => {
        const place = new Place(p, {requestUserId});
        place.creator = new User(p.user, {
          firebaseProfile: await this.firebaseService.getUser(p.user.uid),
          samePerson: requestUserId.toHexString() === p.user.id,
          sameGroup: true,
          requestUserLocation,
        });
        return place;
      }))).filter((p) => p.creator.name));
    } catch (error) { throw error; }
  }
}
