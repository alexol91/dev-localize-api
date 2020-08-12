import { ObjectId } from 'mongodb';

import { RoutesService } from './routes.service';

import { LocationsServiceProvider } from '../db/services/locations.service.mock';

import { generateDateString } from '../../test/helpers/generate.helper';
import { setupModule } from '../../test/helpers/unit.tests.helper';

describe('RoutesService', () => {
  let service: RoutesService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    userId = new ObjectId();

    const providers = [
      LocationsServiceProvider,
      RoutesService,
    ];
    const module = await setupModule(providers);
    service = module.get<RoutesService>(RoutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllLocations', () => {
    it('should return IRouteLocation[]', async () => {
      try {
        const route = await service.getRouteBetween(userId, new Date(generateDateString()), new Date(generateDateString()));
        expect(route).toBeDefined();
        expect(Array.isArray(route)).toBeTruthy();
      } catch (error) { fail(error); }
    });
  });
});
