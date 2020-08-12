import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { DeviceSettingsService } from './device.settings.service';
import { GroupsService } from './groups.service';
import { LocationsService } from './locations.service';
import { MongoService } from './mongo.service';
import { PlaceAlertService } from './place.alert.service';
import { PlacesService } from './places.service';
import { UserAlertService } from './user.alert.service';
import { UserAppService } from './user.app.service';

import { IAddUser } from '../interfaces/user.add.interface';
import { IUser } from '../interfaces/user.interface';

export const ERRORS = {
  DELETEERROR: new InternalServerErrorException('Unable to delete user.'),
  UNABLETOLEAVEGROUPS: new InternalServerErrorException('Unable to leave all groups.'),
};

@Injectable()
export class UsersService extends MongoService<IUser> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private deviceSettingsService: DeviceSettingsService,
    private groupsService: GroupsService,
    private locationsService: LocationsService,
    private placesService: PlacesService,
    private placeAlertService: PlaceAlertService,
    private userAlertService: UserAlertService,
    private userAppService: UserAppService,
  ) { super(userModel); }

  async addUser(dto: IAddUser): Promise<IUser> {
    try {
      return await this.create(dto);
    } catch (error) { throw error; }
  }

  async deleteUser(userId: ObjectId): Promise<void> {
    try {
      await Promise.all([
        this.deviceSettingsService.deleteOne({userId}).catch((err) => { throw(new InternalServerErrorException('Unable to delete device settings.')); }),
        this.locationsService.deleteLocations(userId).catch((err) => { throw(new InternalServerErrorException('Unable to delete locations.')); }),
        this.placeAlertService.deleteMany({userId}).catch((err) => { throw(new InternalServerErrorException('Unable to delete place alerts.')); }),
        this.userAlertService.deleteMany({userId}).catch((err) => { throw(new InternalServerErrorException('Unable to delete user alerts.')); }),
        this.userAlertService.deleteMany({alertedUserId: userId}).catch((err) => { throw(new InternalServerErrorException('Unable to delete alertee alerts.')); }),
        this.userAppService.deleteMany({userId}).catch((err) => { throw(new InternalServerErrorException('Unable to delete user apps.')); }),
      ]);

      await this.placesService.deletePlacesByUser(userId).catch((err) => { throw(new InternalServerErrorException('Unable to delete user places.')); });
      await this.groupsService.leaveAllGroups(userId).catch((err) => { throw(ERRORS.UNABLETOLEAVEGROUPS); });

      await this.deleteOne({_id: userId}).catch((err) => { throw(ERRORS.DELETEERROR); });
    } catch (error) { throw error; }
  }

  async getUserByFirebaseUid(searchingForUserUid: string, requestUserId?: ObjectId): Promise<IUser> {
    try {
      const user: IUser = await this.aggregate([
        this.aggregateMatch({ uid: searchingForUserUid }),
        this.aggregateAddFields({id: '$_id'}),

        this.aggregateLookup('locations', 'locations', { userId: '$_id' }, this.aggregatePipeline(
          this.aggregateMatch({ $expr: { $eq: ['$userId', '$$userId'] } }),
          this.aggregateSort({ timestamp: -1 }),
          this.aggregateLimit(1),
          this.aggregateAddFields({id: '$_id'}),
        )),
      ], true);

      if (user) {
        user.id = user.id.toString();
        if (user.locations) { user.locations.forEach((l) => l.id = l.id.toString()); }
      }

      return user;
    } catch (error) { throw error; }
  }
}
