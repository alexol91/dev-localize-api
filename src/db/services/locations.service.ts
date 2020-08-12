import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as d3 from 'd3-geo';
import { BulkWriteResult, ObjectId, WriteError } from 'mongodb';
import { Model } from 'mongoose';

import { MongoService } from './mongo.service';

import { IAddLocation } from '../interfaces/location.add.interface';
import { ILocation } from '../interfaces/location.interface';

const METERSPERRADIAN = 6371000;

const ERRORS = {
  NOVALIDLOCATIONS: new BadRequestException('None of locations is valid'),
  NONEWLOCATIONS: new BadRequestException('All locations already exist or are invalid.'),
};

@Injectable()
export class LocationsService extends MongoService<ILocation> {
  constructor(
    @InjectModel('Location') private readonly locationModel: Model<ILocation>,
  ) { super(locationModel); }

  async addLocations(userId: ObjectId, newLocations: IAddLocation[]): Promise<ILocation[]> {
    try {
      const insertedIds = await this.insertMany(newLocations, {ordered: false})
        .then((locs) => {
          if (locs.length === 0) { throw ERRORS.NOVALIDLOCATIONS; }
          return locs.map((l) => new ObjectId(l.id));
        })
        .catch(async (error) => {
          if (error === ERRORS.NOVALIDLOCATIONS) { throw error; }

          const e: BulkWriteResult = error.result;
          // if (e.nInserted === 0) { throw ERRORS.NONEWLOCATIONS; }
          const errorIndexes = e.getWriteErrors().map((err: WriteError) => err.index);
          return e.getInsertedIds()
            .filter((i: {index: number, _id: string}) => !errorIndexes.includes(i.index))
            .map((i: {index: number, _id: string}) => i._id);
        });

      if (insertedIds.length === 0) { return []; }

      const locations: ILocation[] = await this.aggregate([
        this.aggregateMatch({ _id: { $in: insertedIds } }),
        this.aggregateAddFields({id: '$_id'}),

        this.aggregateLookup('users', 'user', { userId: '$userId' }, this.aggregatePipeline(
          this.aggregateMatch({ $expr: { $eq: ['$_id', '$$userId'] } }),
          this.aggregateAddFields({id: '$_id'}),
          )),
        this.aggregateUnwind('$user'),
      ]);

      locations.forEach((l) => {
        l.id = l.id.toString();
        l.user.id = l.user.id.toString();
      });

      return locations;
    } catch (error) { throw error; }
  }

  async deleteLocations(userId: ObjectId): Promise<void> {
    try {
      await this.deleteMany({userId});
    } catch (error) { throw error; }
  }

  getDistanceBetween(coordinates: [number, number], coordinates2: [number, number]): number {
    return d3.geoDistance(coordinates, coordinates2) * METERSPERRADIAN;
  }

  async getLatestLocation(userId: ObjectId): Promise<ILocation> {
    try {
      return await this.locationModel.findOne({userId})
        .sort({timestamp: -1})
        .limit(1);
    } catch (error) { throw error; }
  }

  async getLocationsBetween(userId: ObjectId, startDate: Date, endDate: Date): Promise<ILocation[]> {
    try {
      return await this.findMany({
        $and: [
          {  timestamp: { $gte: new Date(startDate.toISOString())} },
          {  timestamp: { $lte: new Date(endDate.toISOString())} },
        ],
        userId,
      });
    } catch (error) { throw error; }
  }

  async getNearLocation(userId: ObjectId, coordinates,  $minDistance, $maxDistance, sort = -1, timestampQuery?) {
    try {
      const query: any = {
        userId,
        point: { $near: { $geometry: { type: 'Point',  coordinates }, $minDistance, $maxDistance }},
      };
      if (timestampQuery) {
        query.timestamp = timestampQuery;
      }
      return await this.locationModel.findOne(query)
        .sort({timestamp: sort})
        .limit(1);
    } catch (error) { throw error; }
  }
}
