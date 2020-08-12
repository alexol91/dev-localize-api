import { ObjectId } from 'mongodb';

import { UserAlertController } from './user-alert.controller';

import { FirebaseServiceProvider } from '../../common/services/firebase.service.mock';
import { GroupsServiceProvider } from '../../db/services/groups.service.mock';
import { UserAlertServiceProvider } from '../../db/services/user.alert.service.mock';
import { UsersServiceProvider } from '../../db/services/users.service.mock';

import { generateToggleUserAlertDTO } from './dto/ToggleUserAlert.generate';

import { generateString } from '../../../test/helpers/generate.helper';
import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('UserAlert Controller', () => {
  let alerteeUid: string;
  let controller: UserAlertController;
  let groupId: ObjectId;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    alerteeUid = generateString(28);
    groupId = new ObjectId();
    userId = new ObjectId();

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        UserAlertServiceProvider,
        UsersServiceProvider,
      ],
      [UserAlertController],
    );
    controller = module.get<UserAlertController>(UserAlertController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('toggleUserAlert', () => {
    it('should return void', async () => {
      try {
        const { payload } = await controller.toggleUserAlert(userId, groupId, alerteeUid, generateToggleUserAlertDTO());
        expect(payload).toBeFalsy();
      } catch (error) { fail(error); }
    });
  });
});
