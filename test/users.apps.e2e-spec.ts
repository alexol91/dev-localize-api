import { INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { UserAppsModule } from '../src/user-apps/user-apps.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { UsersService } from '../src/db/services/users.service';

import { generateAddUserAppDTO } from '../src/user-apps/dto/AddUserApp.generate';

import { postRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';

const invalidToken = 'THISISNOTATOKEN';

describe('User Apps', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;
  let user1: any;
  let usersService: UsersService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([UserAppsModule]);

    firebaseService = module.get<FirebaseService>(FirebaseService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
    userId = new ObjectId(user1.id);
  });

  describe('/POST user/apps/add', () => {
    let path: string;

    beforeAll(async () => {
      path = '/user/apps/add';
    });

    it('adds user app', async () => {
      return postRequest(app, path, user1.token, generateAddUserAppDTO())
        .expect('Content-Type', /json/)
        .expect(201);
    });

    it('fails w/o token', () => {
      return postRequest(app, path, undefined, generateAddUserAppDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return postRequest(app, path, invalidToken, generateAddUserAppDTO())
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails w/o body', async () => {
      return postRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  afterAll(async () => {
    await firebaseService.signOut();
    await app.close();
  });
});
