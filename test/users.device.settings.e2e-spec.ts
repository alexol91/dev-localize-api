import { INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { DeviceSettingsModule } from '../src/device-settings/device-settings.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { UsersService } from '../src/db/services/users.service';

import { generateEditDeviceSettingsDTO } from '../src/device-settings/dto/EditDeviceSettings.generate';

import { getRequest, putRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';

const invalidToken = 'THISISNOTATOKEN';

describe('User Device Settings', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;
  let user1: any;
  let usersService: UsersService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([DeviceSettingsModule]);

    firebaseService = module.get<FirebaseService>(FirebaseService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
    userId = new ObjectId(user1.id);
  });

  describe('/PUT user/settings/edit', () => {
    let path: string;

    beforeAll(async () => {
      path = '/user/settings/edit';
    });

    it('changes device settings', async (done) => {
      return putRequest(app, path, user1.token, generateEditDeviceSettingsDTO())
        .expect('Content-Type', /json/)
        .expect(201)
        .then(async (res) => {
          const settings = res.body.payload;
          expect(settings).toBeDefined();
          done();
        });
    });

    it('fails w/o token', () => {
      return putRequest(app, path, undefined, generateEditDeviceSettingsDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return putRequest(app, path, invalidToken, generateEditDeviceSettingsDTO())
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails w/o body', async () => {
      return putRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  afterAll(async () => {
    await firebaseService.signOut();
    await app.close();
  });
});
