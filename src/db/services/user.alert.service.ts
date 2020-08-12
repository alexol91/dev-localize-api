import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { MongoService } from './mongo.service';

import { IUserAlert } from '../interfaces/user.alert.interface';

@Injectable()
export class UserAlertService extends MongoService<IUserAlert> {
  constructor(
    @InjectModel('UserAlert') private readonly UserAlertModel: Model<IUserAlert>,
  ) { super(UserAlertModel); }

  async getUserAlerts(groupId: ObjectId, userId: ObjectId): Promise<IUserAlert[]> {
    try {
      return await this.findMany({groupId, userId});
    } catch (error) { throw error; }
  }

  async toggleUserAlert(alertedUserId: ObjectId, groupId: ObjectId, userId: ObjectId, enabled: boolean): Promise<void> {
    try {
      await this.updateOne({userId, groupId, alertedUserId}, {enabled}, true);
    } catch (error) { throw error; }
  }
}
