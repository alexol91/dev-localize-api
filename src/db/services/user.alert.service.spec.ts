import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { UserAlertService } from './user.alert.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { generateIUserAlert } from './user.alert.service.mock';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('UserAlert Service', () => {
  let alertedUserId: ObjectId;
  let groupId: ObjectId;
  let service: UserAlertService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    alertedUserId = new ObjectId();
    groupId = new ObjectId();
    userId = new ObjectId();

    const providers = [
      { provide: getModelToken('UserAlert'), useValue: new MongoModelMock(generateIUserAlert) },
      UserAlertService,
    ];
    const module = await setupModule(providers);
    service = module.get<UserAlertService>(UserAlertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserAlerts', () => {
    it('should return IUserAlert[]', async () => {
      try {
        const alerts = await service.getUserAlerts(groupId, userId);
        expect(alerts).toBeDefined();
        expect(Array.isArray(alerts)).toBeTruthy();
        expect(alerts.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  describe('enableUserAlert', () => {
    it('should return void', async () => {
      try {
        const result = await service.toggleUserAlert(alertedUserId, groupId, userId, true);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });
});
