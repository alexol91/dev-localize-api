import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { UsersService } from './users.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { DeviceSettingsServiceProvider } from './device.settings.service.mock';
import { GroupsServiceProvider } from './groups.service.mock';
import { LocationsServiceProvider } from './locations.service.mock';
import { PlaceAlertServiceProvider } from './place.alert.service.mock';
import { PlacesServiceProvider } from './places.service.mock';
import { UserAlertServiceProvider } from './user.alert.service.mock';
import { UserAppServiceProvider } from './user.app.service.mock';
import { generateIAddUser, generateIUser, generateUserUid } from './users.service.mock';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('User Service', () => {
  let groupId: ObjectId;
  let service: UsersService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    groupId = new ObjectId();
    userId = new ObjectId();

    const providers = [
      { provide: getModelToken('User'), useValue: new MongoModelMock(generateIUser) },
      UsersService,
      DeviceSettingsServiceProvider,
      GroupsServiceProvider,
      LocationsServiceProvider,
      PlaceAlertServiceProvider,
      PlacesServiceProvider,
      UserAlertServiceProvider,
      UserAppServiceProvider,
    ];
    const module = await setupModule(providers);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () =>
    expect(service).toBeDefined());

  describe('addUser', () => {
    it('should return IUser', async () => {
      try {
        const user = await service.addUser(generateIAddUser());
        expect(user).toBeDefined();
        expect(user.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('deleteUser', () => {
    it('should return void', async () => {
      try {
        const result = await service.deleteUser(userId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('getUserByFirebaseUid', () => {
    it('should return IUser', async () => {
      try {
        const user = await service.getUserByFirebaseUid(generateUserUid(), userId);
        expect(user).toBeDefined();
        expect(user.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });
});
