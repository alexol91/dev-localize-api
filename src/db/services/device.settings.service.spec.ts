import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { DeviceSettingsService } from './device.settings.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { generateIDeviceSettings, generateIEditDeviceSettings } from './device.settings.service.mock';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('DeviceSettings Service', () => {
  let service: DeviceSettingsService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    userId = new ObjectId();

    const providers = [
      { provide: getModelToken('DeviceSettings'), useValue: new MongoModelMock(generateIDeviceSettings) },
      DeviceSettingsService,
    ];
    const module = await setupModule(providers);
    service = module.get<DeviceSettingsService>(DeviceSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Fix this.model.then problem

  // describe('editDeviceSettings', () => {
  //   it('should return IDeviceSettings', async () => {
  //     try {
  //       const settings = await service.editDeviceSettings(userId, generateIEditDeviceSettings());
  //       expect(settings).toBeDefined();
  //     } catch (error) { fail(error); }
  //   });
  // });
});
