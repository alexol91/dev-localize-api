import { INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { RoutesModule } from '../src/routes/routes.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { LocationsService } from '../src/db/services/locations.service';
import { UsersService } from '../src/db/services/users.service';

import { generateGetRouteDTO } from '../src/routes/dto/GetRoute.generate';

import { getRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';

const invalidToken = 'THISISNOTATOKEN';

describe('Routes', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;
  let locationsService: LocationsService;
  let user1: any;
  let usersService: UsersService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([RoutesModule]);

    firebaseService = module.get<FirebaseService>(FirebaseService);
    locationsService = module.get<LocationsService>(LocationsService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
    userId = new ObjectId(user1.id);
  });

  describe('/POST user/route', () => {
    let path: string;

    beforeAll(async () => {
      const date = '2018-01-01';
      path = `/users/${user1.uid}/route?date=${date}`;
    });

    it('returns locations', async (done) => {
      return getRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          const route = res.body.payload;
          expect(route).toBeDefined();
          expect(Array.isArray(route)).toBeTruthy();
          done();
        });
    });

    it('fails w/o token', () => {
      return getRequest(app, path)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return getRequest(app, path, invalidToken)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  afterAll(async () => {
    await firebaseService.signOut();
    // await usersService.deleteUser(userId);
    await app.close();
  });
});
