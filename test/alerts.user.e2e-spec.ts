import { INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { UserAlertModule } from '../src/alerts/user-alert/user-alert.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { GroupsService } from '../src/db/services/groups.service';
import { UserAlertService } from '../src/db/services/user.alert.service';
import { UsersService } from '../src/db/services/users.service';

import { generateToggleUserAlertDTO } from '../src/alerts/user-alert/dto/ToggleUserAlert.generate';
import { generateIAddGroup } from '../src/db/services/groups.service.mock';

import { postRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';

const invalidToken = 'THISISNOTATOKEN';

describe('User Alerts', () => {
  let app: INestApplication;
  let userAlertsService: UserAlertService;
  let firebaseService: FirebaseService;
  let groupsService: GroupsService;
  let user1: any;
  let user2: any;
  let usersService: UsersService;
  let userId: ObjectId;
  let userId2: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([UserAlertModule]);

    userAlertsService = module.get<UserAlertService>(UserAlertService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    groupsService = module.get<GroupsService>(GroupsService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
    user2 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER2_ID);
    userId = new ObjectId(user1.id);
    userId2 = new ObjectId(user2.id);
  });

  describe('/POST alerts/groups/:groupId/users/:userId/toggle', () => {
    let groupId: ObjectId;
    let path: string;

    beforeAll(async () => {
      const group = await groupsService.addGroup(userId, generateIAddGroup());
      groupId = new ObjectId(group.id);
      await groupsService.joinGroup(userId2, group.code.value);

      path = `/alerts/groups/${group.id}/users/${user2.uid}/toggle`;
      await userAlertsService.toggleUserAlert(userId, groupId, userId2, false);
    });

    it('disables user alert', async () => {
      return postRequest(app, path, user1.token, generateToggleUserAlertDTO(false))
        .expect('Content-Type', /json/)
        .expect(201);
    });

    it('fails w/o token', () => {
      return postRequest(app, path, undefined, generateToggleUserAlertDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return postRequest(app, path, invalidToken, generateToggleUserAlertDTO())
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails w/o body', async () => {
      return postRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    afterAll(async () => {
      await groupsService.leaveGroup(userId, groupId);
      await groupsService.leaveGroup(userId2, groupId);
    });
  });

  afterAll(async () => {
    await firebaseService.signOut();
    await app.close();
  });
});
