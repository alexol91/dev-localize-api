import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { LocationsService } from './locations.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { generateIAddLocation, generateILocation } from './locations.service.mock';

import { generateDateString } from '../../../test/helpers/generate.helper';
import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('Locations Service', () => {
  let groupId: ObjectId;
  let placeId: ObjectId;
  let service: LocationsService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    groupId = new ObjectId();
    placeId = new ObjectId();
    userId = new ObjectId();

    const providers = [
      { provide: getModelToken('Location'), useValue: new MongoModelMock(generateILocation) },
      LocationsService,
    ];
    const module = await setupModule(providers);
    service = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addLocation', () => {
    it('should return ILocation[]', async () => {
      try {
        const locations = await service.addLocations(userId, [generateIAddLocation()]);
        expect(locations).toBeDefined();
        expect(Array.isArray(locations)).toBeTruthy();
        expect(locations.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  describe('deleteLocations', () => {
    it('should return void', async () => {
      try {
        const result = await service.deleteLocations(userId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('getDistanceBetween', () => {
    it('should return void', async () => {
      try {
        const result = await service.getDistanceBetween(generateILocation(false).point.coordinates, generateILocation(false).point.coordinates);
        expect(result).toBeDefined();
        expect(result).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  describe('getLatestLocation', () => {
    it('should return ILocation', async () => {
      try {
        const location = await service.getLatestLocation(userId);
        expect(location).toBeDefined();
        expect(location.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('getLocationsBetween', () => {
    it('should return ILocation[]', async () => {
      try {
        const locations = await service.getLocationsBetween(userId, new Date(generateDateString()), new Date(generateDateString()));
        expect(locations).toBeDefined();
        expect(Array.isArray(locations)).toBeTruthy();
      } catch (error) { fail(error); }
    });
  });
});
