import { ObjectId } from 'mongodb';

import { DeviceSettingsService } from './device.settings.service';

import { MongoServiceMock } from './mongo.service.mock';

export const generateIDeviceSettings = (generateNested = true) => ({
  id: new ObjectId().toHexString(),
  backgroundRefresh: '0',
  forceClose: '1',
  locationPermissions: '0',
  locationServices: '1',
  powerSaveMode: '0',
});

export const generateIEditDeviceSettings = () => ({
  backgroundRefresh: '0',
  locationPermissions: '0',
  powerSaveMode: '0',
});

export class DeviceSettingsServiceMock extends MongoServiceMock {
  constructor() {
    super(generateIDeviceSettings);
  }

  editDeviceSettings(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIDeviceSettings()));
  }
}

export const DeviceSettingsServiceProvider = {
  provide: DeviceSettingsService,
  useClass: DeviceSettingsServiceMock,
};
