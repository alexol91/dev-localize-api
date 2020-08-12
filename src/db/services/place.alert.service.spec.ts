import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { PlaceAlertService } from './place.alert.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { generateIPlaceAlert } from './place.alert.service.mock';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('PlaceAlert Service', () => {
  let placeId: ObjectId;
  let service: PlaceAlertService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    placeId = new ObjectId();
    userId = new ObjectId();

    const providers = [
      { provide: getModelToken('PlaceAlert'), useValue: new MongoModelMock(generateIPlaceAlert) },
      PlaceAlertService,
    ];
    const module = await setupModule(providers);
    service = module.get<PlaceAlertService>(PlaceAlertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('togglePlaceAlert', () => {
    it('should return void', async () => {
      try {
        const result = await service.togglePlaceAlert(userId, placeId, false);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('getPlaceAlerts', () => {
    it('should return IPlaceAlert[]', async () => {
      try {
        const alerts = await service.getPlaceAlerts(userId);
        expect(alerts).toBeDefined();
        expect(Array.isArray(alerts)).toBeTruthy();
        expect(alerts.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });
});
