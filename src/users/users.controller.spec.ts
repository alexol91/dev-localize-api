import { ObjectId } from 'mongodb';

import { UsersController } from './users.controller';

import { FirebaseServiceProvider } from '../common/services/firebase.service.mock';
import { NotificationServiceProvider } from '../common/services/notification.service.mock';
import { GroupsServiceProvider } from '../db/services/groups.service.mock';
import { LocationsServiceProvider } from '../db/services/locations.service.mock';
import { UserAppServiceProvider } from '../db/services/user.app.service.mock';
import { generateUserUid, UsersServiceProvider } from '../db/services/users.service.mock';

import { setupModule } from '../../test/helpers/unit.tests.helper';

describe('Users Controller', () => {
  let controller: UsersController;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    userId = new ObjectId();

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        LocationsServiceProvider,
        NotificationServiceProvider,
        UserAppServiceProvider,
        UsersServiceProvider,
      ],
      [UsersController],
    );
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () =>
    expect(controller).toBeDefined());

  describe('getUser', () => {
    it('should return User', async () => {
      try {
        const { payload: user } = await controller.getUser(userId, generateUserUid());
        expect(user).toBeDefined();
        expect(user.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('deleteUser', () => {
    it('should return void', async () => {
      try {
        const { payload } = await controller.deleteUser(userId);
        expect(payload).toBeFalsy();
      } catch (error) { fail(error); }
    });
  });
});
