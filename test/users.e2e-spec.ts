import { INestApplication } from '@nestjs/common';
import { validate } from 'class-validator';

import { UsersModule } from '../src/users/users.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { UsersService } from '../src/db/services/users.service';

import { User } from '../src/db/models/user.model';

import { deleteRequest, getRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';

import { ERRORS as MONGOERRORS } from '../src/db/services/mongo.service';

const invalidToken = 'THISISNOTATOKEN';

describe('Users Module', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;
  let user1: any;
  let usersService: UsersService;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([UsersModule]);

    firebaseService = module.get<FirebaseService>(FirebaseService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
  });

  describe('/GET users/:id', () => {
    const path = (userId) => `/users/${userId}`;

    it('returns user', (done) => {
      return getRequest(app, path(user1.uid), user1.token)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(async (res) => {
          const user = res.body.payload;
          expect(user).toBeDefined();
          // expect(await validateUser(user));
          done();
        });
    });

    it('fails w/o token', () => {
      return getRequest(app, path(user1.uid))
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return getRequest(app, path(user1.uid), invalidToken)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  // describe('/DELETE user/delete', () => {
  //   let path: string;

  //   beforeAll(async () => {
  //     path = '/user/delete';
  //   });

  //   it('deletes user', async (done) => {
  //     return deleteRequest(app, path, user1.token)
  //       .expect('Content-Type', /json/)
  //       .expect(200)
  //       .then(async () => {
  //         let userExist = true;
  //         await usersService.getUserByFirebaseUid(user1.uid).catch((err) => {
  //           if (err === MONGOERRORS.NOTEXIST) { userExist = false; }
  //         });
  //         expect(userExist).toBeFalsy();
  //         done();
  //       });
  //   });

  //   it('fails w/o token', () => {
  //     return deleteRequest(app, path, undefined)
  //       .expect('Content-Type', /json/)
  //       .expect(400);
  //   });

  //   it('fails with invalid token', () => {
  //     return deleteRequest(app, path, invalidToken)
  //       .expect('Content-Type', /json/)
  //       .expect(401);
  //   });
  // });

  afterAll(async () => {
    await firebaseService.signOut();
    await app.close();
  });
});
