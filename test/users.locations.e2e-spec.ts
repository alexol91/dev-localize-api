import { INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { LocationsModule } from '../src/locations/locations.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { LocationsService } from '../src/db/services/locations.service';
import { UsersService } from '../src/db/services/users.service';

import { generateAddLocationDTO } from '../src/locations/dto/AddLocation.generate';

import { getRequest, postRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';

const invalidBody = { invalid: true };
const invalidToken = 'THISISNOTATOKEN';

describe('Locations', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;
  let locationsService: LocationsService;
  let user1: any;
  let usersService: UsersService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([LocationsModule]);

    firebaseService = module.get<FirebaseService>(FirebaseService);
    locationsService = module.get<LocationsService>(LocationsService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
    userId = new ObjectId(user1.id);
  });

  describe('/POST user/locations/add', () => {
    let path: string;

    beforeAll(async () => {
      path = '/user/locations/add';
    });

    it('returns added location', async (done) => {
      return postRequest(app, path, user1.token, generateAddLocationDTO())
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          const locations = res.body.payload;
          expect(locations).toBeDefined();
          expect(locations.length).toBe(1);
          done();
        });
    });

    it('fails with partially invalid location', async () => {
      return postRequest(app, path, user1.token, {lon: 23, invalid: 'invalid'})
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid location', async () => {
      return postRequest(app, path, user1.token, {invalid: 'invalid'})
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('returns added location (filtered invalid and copies)', async (done) => {
      const location = generateAddLocationDTO();
      return postRequest(app, path, user1.token, [location, location, {lon: 23, invalid: 'invalid'}, {invalid: 'invalid'}])
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          const locations = res.body.payload;
          expect(locations).toBeDefined();
          expect(locations.length).toBe(1);
          done();
        });
    });

    it('fails w/o token', () => {
      return postRequest(app, path, undefined, generateAddLocationDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return postRequest(app, path, invalidToken, invalidBody)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    // it('fails with invalid body', async () => {
    //   return postRequest(app, path, user1.token, INVALIDDTOADDLOCATION)
    //     .expect('Content-Type', /json/)
    //     .expect(400);
    // });
  });

  afterAll(async () => {
    await firebaseService.signOut();
    // await usersService.deleteUser(userId);
    await app.close();
  });
});
