import { INestApplication } from '@nestjs/common';
import { validate } from 'class-validator';
import { ObjectId } from 'mongodb';

import { PlacesModule } from '../src/places/places.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { GroupsService } from '../src/db/services/groups.service';
import { generateIAddGroup } from '../src/db/services/groups.service.mock';
import { PlacesService } from '../src/db/services/places.service';
import { generateIAddPlace } from '../src/db/services/places.service.mock';
import { UsersService } from '../src/db/services/users.service';

import { IGroup } from '../src/db/interfaces/group.interface';
import { IPlace } from '../src/db/interfaces/place.interface';
import { Place } from '../src/db/models/place.model';

import { generateAddPlaceDTO } from '../src/places/dto/AddPlace.generate';
import { generateEditPlaceDTO } from '../src/places/dto/EditPlace.generate';

import { deleteRequest, getRequest, postRequest, putRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';
import { generateString } from './helpers/generate.helper';

const invalidBody = { invalid: true };
const invalidToken = 'THISISNOTATOKEN';

describe('Places', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;
  let groupsService: GroupsService;
  let placesService: PlacesService;
  let user1: any;
  let usersService: UsersService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([PlacesModule]);

    firebaseService = module.get<FirebaseService>(FirebaseService);
    groupsService = module.get<GroupsService>(GroupsService);
    placesService = module.get<PlacesService>(PlacesService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
    userId = new ObjectId(user1.id);
  });

  describe('/GET user/groups/groupId/places', () => {
    let group: IGroup;
    let path: string;
    let place: IPlace;

    beforeAll(async () => {
      group = await groupsService.addGroup(userId, generateIAddGroup());
      place = await placesService.addPlace(userId, generateIAddPlace(userId, new ObjectId(group.id)));
      path = `/user/groups/${group.id}/places`;
    });

    it('returns places', (done) => {
      return getRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(async (res) => {
          const places = res.body.payload;
          expect(places).toBeDefined();
          expect(places.length).not.toBe(0);
          // expect(await validatePlace(places[0]));
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

    afterAll(async () => {
      await groupsService.leaveGroup(userId, new ObjectId(group.id));
    });
  });

  describe('/POST user/groups/groupId/places/add', () => {
    let group: IGroup;
    let path: string;

    beforeAll(async () => {
      group = await groupsService.addGroup(userId, generateIAddGroup());
      path = `/user/groups/${group.id}/places/add`;
    });

    it('returns created place', async (done) => {
      return postRequest(app, path, user1.token, generateAddPlaceDTO())
        .expect('Content-Type', /json/)
        .expect(201)
        .then(async (res) => {
          const place = res.body.payload;
          expect(place).toBeDefined();
          // expect(await validatePlace(place));
          done();
        });
    });

    it('fails w/o token', () => {
      return postRequest(app, path, undefined, generateAddPlaceDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return postRequest(app, path, invalidToken, generateAddPlaceDTO())
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails with invalid body', async () => {
      return postRequest(app, path, user1.token, invalidBody)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    afterAll(async () => {
      await groupsService.leaveGroup(userId, new ObjectId(group.id));
    });
  });

  describe('/PUT user/groups/groupId/places/:id/edit', () => {
    let group: IGroup;
    let path: string;
    let place: IPlace;

    beforeAll(async () => {
      group = await groupsService.addGroup(userId, generateIAddGroup());
      place = await placesService.addPlace(userId, generateIAddPlace(userId, new ObjectId(group.id)));
      path = `/user/groups/${group.id}/places/${place.id}/edit`;
    });

    it('returns edited place', async (done) => {
      const name = generateString(10);
      return putRequest(app, path, user1.token, {name})
        .expect('Content-Type', /json/)
        .expect(201)
        .then(async (res) => {
          const resplace = res.body.payload;
          expect(resplace).toBeDefined();
          // expect(await validatePlace(resplace));
          expect(resplace.name).toEqual(name);
          done();
        });
    });

    it('fails w/o token', () => {
      return putRequest(app, path, undefined, generateEditPlaceDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return putRequest(app, path, invalidToken, generateEditPlaceDTO())
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('fails with invalid body', async () => {
      return putRequest(app, path, user1.token, invalidBody)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    afterAll(async () => {
      await groupsService.leaveGroup(userId, new ObjectId(group.id));
    });
  });

  describe('/DELETE user/groups/groupId/places/:id/delete', () => {
    let group: IGroup;
    let path: string;

    beforeAll(async () => {
      group = await groupsService.addGroup(userId, generateIAddGroup());
      const place = await placesService.addPlace(userId, generateIAddPlace(userId, new ObjectId(group.id)));
      path = `/user/groups/${group.id}/places/${place.id}/delete`;
    });

    it('deletes a place', async () => {
      return deleteRequest(app, path, user1.token)
        .expect('Content-Type', /json/)
        .expect(201);
    });

    it('fails w/o token', () => {
      return deleteRequest(app, path)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return deleteRequest(app, path, invalidToken)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    afterAll(async () => {
      await groupsService.leaveGroup(userId, new ObjectId(group.id));
    });
  });

  afterAll(async () => {
    await firebaseService.signOut();
    // await usersService.deleteUser(userId);
    await app.close();
  });
});
