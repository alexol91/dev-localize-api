import { ObjectId } from 'mongodb';

import { DeviceSettingsController } from './device-settings.controller';

import { FirebaseServiceProvider } from '../common/services/firebase.service.mock';
import { DeviceSettingsServiceProvider } from '../db/services/device.settings.service.mock';
import { GroupsServiceProvider } from '../db/services/groups.service.mock';
import { UsersServiceProvider } from '../db/services/users.service.mock';

import { generateEditDeviceSettingsDTO } from './dto/EditDeviceSettings.generate';

import { setupModule } from '../../test/helpers/unit.tests.helper';

describe('DeviceSettings Controller', () => {
  let controller: DeviceSettingsController;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    userId = new ObjectId();

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        DeviceSettingsServiceProvider,
        UsersServiceProvider,
      ],
      [DeviceSettingsController],
    );
    controller = module.get<DeviceSettingsController>(DeviceSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('editDeviceSettings', () => {
    it('should return DeviceSettings', async () => {
      try {
        const { payload: settings } = await controller.editDeviceSettings(userId, generateEditDeviceSettingsDTO());
        expect(settings).toBeDefined();
      } catch (error) { fail(error); }
    });
  });
});
