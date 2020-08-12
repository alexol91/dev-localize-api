import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { PlacesService } from './places.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { LocationsServiceProvider } from './locations.service.mock';
import { PlaceAlertServiceProvider } from './place.alert.service.mock';
import { generateIAddPlace, generateIEditPlace, generateIPlace } from './places.service.mock';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('Place Service', () => {
  let groupId: ObjectId;
  let placeId: ObjectId;
  let service: PlacesService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    groupId = new ObjectId();
    placeId = new ObjectId();
    userId = new ObjectId();

    const providers = [
      { provide: getModelToken('Place'), useValue: new MongoModelMock(generateIPlace) },
      LocationsServiceProvider,
      PlaceAlertServiceProvider,
      PlacesService,
    ];
    const module = await setupModule(providers);
    service = module.get<PlacesService>(PlacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addPlace', () => {
    it('should return IPlace', async () => {
      try {
        const place = await service.addPlace(userId, generateIAddPlace());
        expect(place).toBeDefined();
        expect(place.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('deletePlace', () => {
    it('should return void', async () => {
      try {
        const result = await service.deletePlace(userId, groupId, placeId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('deletePlacesByGroup', () => {
    it('should return void', async () => {
      try {
        const result = await service.deletePlacesByGroup(groupId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('deletePlacesByUser', () => {
    it('should return void', async () => {
      try {
        const result = await service.deletePlacesByUser(userId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('editPlace', () => {
    it('should return IPlace', async () => {
      try {
        const place = await service.editPlace(userId, groupId, placeId, generateIEditPlace());
        expect(place).toBeDefined();
        expect(place.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('getAllPlaces', () => {
    it('should return IPlace[]', async () => {
      try {
        const places = await service.getAllPlaces(userId, groupId);
        expect(places).toBeDefined();
        expect(Array.isArray(places)).toBeTruthy();
        expect(places.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });
});
