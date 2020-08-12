import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { MongoService } from './mongo.service';

import { IPlaceAlert } from '../interfaces/place.alert.interface';

@Injectable()
export class PlaceAlertService extends MongoService<IPlaceAlert> {
  constructor(
    @InjectModel('PlaceAlert') private readonly PlaceAlertModel: Model<IPlaceAlert>,
  ) { super(PlaceAlertModel); }

  async getPlaceAlerts(userId: ObjectId): Promise<IPlaceAlert[]> {
    try {
      return await this.findMany({userId});
    } catch (error) { throw error; }
  }

  async togglePlaceAlert(userId: ObjectId, placeId: ObjectId, enabled: boolean): Promise<void> {
    try {
      await this.updateOne({userId, placeId}, {enabled}, true);
    } catch (error) { throw error; }
  }
}
