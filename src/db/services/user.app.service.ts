import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { MongoService } from './mongo.service';

import { IAddUserApp } from '../interfaces/user.app.add.interface';
import { IUserApp } from '../interfaces/user.app.interface';

@Injectable()
export class UserAppService extends MongoService<IUserApp> {
  constructor(
    @InjectModel('UserApp') private readonly UserAppModel: Model<IUserApp>,
  ) { super(UserAppModel); }

  async addUserApp(dto: IAddUserApp): Promise<void> {
    try {
      await this.updateOne({registrationToken: dto.registrationToken}, dto, true);
    } catch (error) { throw error; }
  }

  async removeUserApp(userId: ObjectId, registrationToken: string) {
    try {
      await this.deleteOne({userId, registrationToken});
    } catch (error) { throw error; }
  }
}
