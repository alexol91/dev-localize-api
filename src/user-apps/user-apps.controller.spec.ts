import { ObjectId } from 'mongodb';

import { UserAppsController } from './user-apps.controller';

import { FirebaseServiceProvider } from '../common/services/firebase.service.mock';
import { GroupsServiceProvider } from '../db/services/groups.service.mock';
import { UserAppServiceProvider } from '../db/services/user.app.service.mock';
import { UsersServiceProvider } from '../db/services/users.service.mock';

import { generateAddUserAppDTO } from './dto/AddUserApp.generate';
import { generateLogoutAppDTO } from './dto/LogoutApp.generate';

import { setupModule } from '../../test/helpers/unit.tests.helper';

describe('UserApps Controller', () => {
  let controller: UserAppsController;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    userId = new ObjectId();

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        UserAppServiceProvider,
        UsersServiceProvider,
      ],
      [UserAppsController],
    );
    controller = module.get<UserAppsController>(UserAppsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addUserApp', () => {
    it('should return void', async () => {
      try {
        const { payload } = await controller.addUserApp(userId, generateAddUserAppDTO());
        expect(payload).toBeFalsy();
      } catch (error) { fail(error); }
    });
  });

  describe('logoutApp', () => {
    it('should return void', async () => {
      try {
        const { payload } = await controller.logoutApp(userId, generateLogoutAppDTO());
        expect(payload).toBeFalsy();
      } catch (error) { fail(error); }
    });
  });
});
