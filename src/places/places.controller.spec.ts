import { ObjectId } from 'mongodb';

import { PlacesController } from './places.controller';

import { FirebaseServiceProvider } from '../common/services/firebase.service.mock';
import { NotificationServiceProvider } from '../common/services/notification.service.mock';
import { GroupsServiceProvider } from '../db/services/groups.service.mock';
import { LocationsServiceProvider } from '../db/services/locations.service.mock';
import { PlacesServiceProvider } from '../db/services/places.service.mock';
import { UsersServiceProvider } from '../db/services/users.service.mock';

import { generateAddPlaceDTO } from './dto/AddPlace.generate';
import { generateEditPlaceDTO } from './dto/EditPlace.generate';

import { generateString } from '../../test/helpers/generate.helper';
import { setupModule } from '../../test/helpers/unit.tests.helper';

describe('Places Controller', () => {
  let controller: PlacesController;
  let groupId: ObjectId;
  let placeId: ObjectId;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    groupId = new ObjectId();
    placeId = new ObjectId();
    userId = new ObjectId();

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        LocationsServiceProvider,
        NotificationServiceProvider,
        PlacesServiceProvider,
        UsersServiceProvider,
      ],
      [PlacesController],
    );
    controller = module.get<PlacesController>(PlacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPlaces', () => {
    it('should return Place[]', async () => {
      try {
        const { payload: places } = await controller.getAllPlaces(userId, groupId);
        expect(places).toBeDefined();
        expect(Array.isArray(places)).toBeTruthy();
        expect(places.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  describe('addPlace', () => {
    it('should return Place', async () => {
      try {
        const { payload: place } = await controller.addPlace(userId, {name: generateString(10)}, groupId, generateAddPlaceDTO());
        expect(place).toBeDefined();
        expect(place.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('editPlace', () => {
    it('should return Place', async () => {
      try {
        const { payload: place } = await controller.editPlace(userId, {name: generateString(10)}, groupId, placeId, generateEditPlaceDTO());
        expect(place).toBeDefined();
        expect(place.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('deletePlace', () => {
    it('should return void', async () => {
      try {
        const { payload } = await controller.deletePlace(userId, groupId, placeId);
        expect(payload).toBeFalsy();
      } catch (error) { fail(error); }
    });
  });
});
