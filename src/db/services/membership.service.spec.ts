import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { MembershipService } from './membership.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { generateIMembership } from './membership.service.mock';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('Membership Service', () => {
  let groupId: ObjectId;
  let service: MembershipService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    groupId = new ObjectId();
    userId = new ObjectId();

    const providers = [
      { provide: getModelToken('Membership'), useValue: new MongoModelMock(generateIMembership) },
      MembershipService,
    ];
    const module = await setupModule(providers);
    service = module.get<MembershipService>(MembershipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addMember', () => {
    it('should return IMembership', async () => {
      try {
        const groupCode = await service.addMember(groupId, userId, true);
        expect(groupCode).toBeDefined();
        expect(groupCode.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('removeMembers', () => {
    it('should return void', async () => {
      try {
        const result = await service.removeMembers(groupId, userId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('setNewAdmin', () => {
    it('should return void', async () => {
      try {
        const result = await service.setNewAdmin(userId, groupId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });
});
