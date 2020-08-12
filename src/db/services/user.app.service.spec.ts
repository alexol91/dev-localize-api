import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { UserAppService } from './user.app.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { generateIAddUserApp, generateIUserApp } from './user.app.service.mock';

import { generateString } from '../../../test/helpers/generate.helper';
import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('UserApp Service', () => {
  let service: UserAppService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    userId = new ObjectId();

    const providers = [
      { provide: getModelToken('UserApp'), useValue: new MongoModelMock(generateIUserApp) },
      UserAppService,
    ];
    const module = await setupModule(providers);
    service = module.get<UserAppService>(UserAppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addUserApp', () => {
    it('should return void', async () => {
      try {
        const result = await service.addUserApp(generateIAddUserApp(userId));
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('removeUserApp', () => {
    it('should return void', async () => {
      try {
        const result = await service.removeUserApp(userId, generateString(30));
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });
});
