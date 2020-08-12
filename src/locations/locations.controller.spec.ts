import { ObjectId } from 'mongodb';

import { LocationsController } from './locations.controller';

import { FirebaseServiceProvider } from '../common/services/firebase.service.mock';
import { NotificationServiceProvider } from '../common/services/notification.service.mock';
import { GroupsServiceProvider } from '../db/services/groups.service.mock';
import { LocationsServiceProvider } from '../db/services/locations.service.mock';
import { generateUserUid, UsersServiceProvider } from '../db/services/users.service.mock';

import { generateAddLocationDTO } from './dto/AddLocation.generate';

import { generateString } from '../../test/helpers/generate.helper';
import { setupModule } from '../../test/helpers/unit.tests.helper';

describe('Places Controller', () => {
  let controller: LocationsController;
  let userId: ObjectId;
  let userUid: string;

  beforeAll(async () => {
    jest.setTimeout(10000);

    userId = new ObjectId();
    userUid = generateUserUid();

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        LocationsServiceProvider,
        NotificationServiceProvider,
        UsersServiceProvider,
      ],
      [LocationsController],
    );
    controller = module.get<LocationsController>(LocationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addLocations', () => {
    it('should return Location[]', async () => {
      try {
        const { payload: locations } = await controller.addLocations(userId, {name: generateString(10)}, generateAddLocationDTO());
        expect(locations).toBeDefined();
        expect(Array.isArray(locations)).toBeTruthy();
        expect(locations.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });
});
