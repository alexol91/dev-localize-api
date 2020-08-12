import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { MongoService } from './mongo.service';

import { IEditDeviceSettings } from '../interfaces/device.settings.edit.interface';
import { IDeviceSettings } from '../interfaces/device.settings.interface';

@Injectable()
export class DeviceSettingsService extends MongoService<IDeviceSettings> {
  constructor(
    @InjectModel('DeviceSettings') private readonly deviceSettingsModel: Model<IDeviceSettings>,
  ) { super(deviceSettingsModel); }

  async editDeviceSettings(userId: ObjectId, dto: IEditDeviceSettings): Promise<IDeviceSettings> {
    try {
      await this.updateOne({userId}, dto, true);
      return await this.findOne({userId});
    } catch (error) { throw error; }
  }
}
