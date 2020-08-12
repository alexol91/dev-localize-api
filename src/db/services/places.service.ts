import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { MongoService } from './mongo.service';
import { PlaceAlertService } from './place.alert.service';

import { ILocation } from '../interfaces/location.interface';
import { IAddPlace } from '../interfaces/place.add.interface';
import { IEditPlace } from '../interfaces/place.edit.interface';
import { IPlace } from '../interfaces/place.interface';
import { LocationsService } from './locations.service';

@Injectable()
export class PlacesService extends MongoService<IPlace> {
  constructor(
    @InjectModel('Place') private readonly placeModel: Model<IPlace>,
    private locationsService: LocationsService,
    private placeAlertService: PlaceAlertService,
  ) { super(placeModel); }

  async addPlace(userId: ObjectId, dto: IAddPlace): Promise<IPlace> {
    try {
      const place = await this.create(dto);
      return await this.getPlace(userId, new ObjectId(place.id));
    } catch (error) { throw error; }
  }

  async deletePlace(userId: ObjectId, groupId: ObjectId, placeId: ObjectId): Promise<void> {
    try {
      await this.placeAlertService.deleteMany({placeId});
      await this.deleteOne({_id: placeId, groupId, userId});
    } catch (error) { throw error; }
  }

  async deletePlacesByGroup(groupId: ObjectId): Promise<void> {
    try {
      const places = await this.findMany({groupId});
      await this.placeAlertService.deleteMany({placeId: { $in: places.map((p) => p.id) }});
      await this.deleteMany({groupId});
    } catch (error) { throw error; }
  }

  async deletePlacesByUser(userId: ObjectId): Promise<void> {
    try {
      const places = await this.findMany({userId});
      await this.placeAlertService.deleteMany({placeId: { $in: places.map((p) => p.id) }});
      await this.deleteMany({userId});
    } catch (error) { throw error; }
  }

  async editPlace(userId: ObjectId, groupId: ObjectId, placeId: ObjectId, dto: IEditPlace): Promise<IPlace> {
    try {
      await this.updateOne({_id: placeId, groupId, userId}, dto);
      return await this.getPlace(userId, placeId);
    } catch (error) { throw error; }
  }

  async getPlace(userId: ObjectId, placeId: ObjectId): Promise<IPlace> {
    try {
      const place: IPlace = await this.aggregate([
        this.aggregateMatch({ $expr: { $eq: ['$_id', placeId] } }),
        this.aggregateAddFields({id: '$_id'}),

        this.aggregateLookup('users', 'user', { creatorId: '$userId' }, this.aggregatePipeline(
          this.aggregateMatch({ $expr: { $eq: ['$_id', '$$creatorId'] } }),
          this.aggregateAddFields({id: '$_id'}),

          this.aggregateLookup('locations', 'locations', { userId: '$_id' }, this.aggregatePipeline(
            this.aggregateMatch({ $expr: { $eq: ['$userId', '$$userId'] } }),
            this.aggregateSort({ timestamp: -1 }),
            this.aggregateLimit(1),
            this.aggregateAddFields({id: '$_id'}),
          )),
        )),
        this.aggregateUnwind('$user'),

        this.aggregateLookup('placealerts', 'alert', { placeId: '$_id' }, this.aggregatePipeline(
          this.aggregateMatch({ $expr: { $and: [
            { $eq: ['$placeId', '$$placeId'] },
            { $eq: ['$userId', userId] },
          ] }}),
          this.aggregateAddFields({id: '$_id'}),
        )),
        this.aggregateUnwind('$alert', true),
      ], true);

      if (place) {
        place.id = place.id.toString();
        place.user.id = place.user.id.toString();
        if (place.user.locations) { place.user.locations.forEach((l) => l.id = l.id.toString()); }
        if (place.alert) { place.alert.id = place.alert.id.toString(); }
      }

      return place;
    } catch (error) { throw error; }
  }

  async getAllPlaces(userId: ObjectId, groupId: ObjectId): Promise<IPlace[]> {
    try {
      const places: IPlace[] =  await this.aggregate([
        this.aggregateMatch({ groupId }),
        this.aggregateAddFields({id: '$_id'}),

        this.aggregateLookup('users', 'user', { creatorId: '$userId' }, this.aggregatePipeline(
          this.aggregateMatch({ $expr: { $eq: ['$_id', '$$creatorId'] } }),
          this.aggregateAddFields({id: '$_id'}),

          this.aggregateLookup('locations', 'locations', { userId: '$_id' }, this.aggregatePipeline(
            this.aggregateMatch({ $expr: { $eq: ['$userId', '$$userId'] } }),
            this.aggregateSort({ timestamp: -1 }),
            this.aggregateLimit(1),
            this.aggregateAddFields({id: '$_id'}),
          )),
        )),
        this.aggregateUnwind('$user'),

        this.aggregateLookup('placealerts', 'alert', { placeId: '$_id' }, this.aggregatePipeline(
          this.aggregateMatch({ $expr: { $and: [
            { $eq: ['$placeId', '$$placeId'] },
            { $eq: ['$userId', userId] },
          ] }}),
          this.aggregateAddFields({id: '$_id'}),
        )),
        this.aggregateUnwind('$alert', true),
      ]);

      const promises = places.map(async (place) => {
        place.id = place.id.toString();
        place.user.id = place.user.id.toString();
        if (place.user.locations) { place.user.locations.forEach((l) => l.id = l.id.toString()); }
        if (place.alert) { place.alert.id = place.alert.id.toString(); }

        const visit = await this.getLastVisit(userId, place);
        place.enteredAt = visit.enteredAt;
        place.leftAt = visit.leftAt;
        return place;
      });

      return await Promise.all(promises);
    } catch (error) { throw error; }
  }

  async getLastVisit(userId: ObjectId, place: IPlace): Promise<{enteredAt?: ILocation, leftAt?: ILocation}> {
    try {
      const lastIn: ILocation = await this.locationsService.getNearLocation(userId, place.point.coordinates, 0, place.radius);

      if (lastIn) {
        const lastOutBeforeLastIn: ILocation = await this.locationsService.getNearLocation(userId, place.point.coordinates, place.radius, 20000000, -1,
          { $lte: new Date(lastIn.timestamp)});

        const enteredAt: ILocation = await this.locationsService.getNearLocation(userId, place.point.coordinates, 0, place.radius, 1,
          { $gte: lastOutBeforeLastIn ? new Date(lastOutBeforeLastIn.timestamp) : new Date(0)});

        const leftAt: ILocation = await this.locationsService.getNearLocation(userId, place.point.coordinates, place.radius, 20000000, 1,
          { $gte: new Date(lastIn.timestamp)});

        if (enteredAt) { enteredAt.id = enteredAt.id.toString(); }
        if (leftAt) { leftAt.id = leftAt.id.toString(); }

        return { enteredAt, leftAt };
      } else {
        return {};
      }
    } catch (error) { throw error; }
  }
}
