import { INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { PlaceAlertModule } from '../src/alerts/place-alert/place-alert.module';

import { FirebaseService } from '../src/common/services/firebase.service';
import { GroupsService } from '../src/db/services/groups.service';
import { PlacesService } from '../src/db/services/places.service';
import { UsersService } from '../src/db/services/users.service';

import { IPlace } from '../src/db/interfaces/place.interface';

import { generateTogglePlaceAlertDTO } from '../src/alerts/place-alert/dto/TogglePlaceAlert.generate';
import { generateIAddGroup } from '../src/db/services/groups.service.mock';
import { generateIAddPlace } from '../src/db/services/places.service.mock';

import { postRequest, setupModule, setupTestUser } from './helpers/e2e.tests.helper';

const invalidToken = 'THISISNOTATOKEN';

describe('Place Alerts', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;
  let groupsService: GroupsService;
  let placesService: PlacesService;
  let user1: any;
  let usersService: UsersService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(20000);

    const module = await setupModule([PlaceAlertModule]);

    firebaseService = module.get<FirebaseService>(FirebaseService);
    groupsService = module.get<GroupsService>(GroupsService);
    placesService = module.get<PlacesService>(PlacesService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    await app.init();

    user1 = await setupTestUser(app, firebaseService, usersService, process.env.FIREBASE_TEST_USER_ID);
    userId = new ObjectId(user1.id);
  });

  describe('/POST alerts/places/:placeId/toggle', () => {
    let groupId: ObjectId;
    let path: string;
    let place: IPlace;

    beforeAll(async () => {
      groupId = new ObjectId((await groupsService.addGroup(userId, generateIAddGroup())).id);
      place = await placesService.addPlace(userId, generateIAddPlace(userId, groupId));
      path = `/alerts/places/${place.id}/toggle`;
    });

    it('disables place alert', async () => {
      return postRequest(app, path, user1.token, generateTogglePlaceAlertDTO(false))
        .expect('Content-Type', /json/)
        .expect(201);
    });

    it('fails w/o token', () => {
      return postRequest(app, path, undefined, generateTogglePlaceAlertDTO())
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with invalid token', () => {
      return postRequest(app, path, invalidToken, generateTogglePlaceAlertDTO())
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
    });
  });

  afterAll(async () => {
    await firebaseService.signOut();
    await app.close();
  });
});
