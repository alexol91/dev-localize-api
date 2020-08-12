import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { GroupCodeService } from './groupcode.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { generateIGroupCode } from './groupcode.service.mock';
import { generateIJoinGroup } from './groups.service.mock';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('Groupcode Service', () => {
  let groupId: ObjectId;
  let service: GroupCodeService;

  beforeAll(async () => {
    jest.setTimeout(10000);

    groupId = new ObjectId();

    const providers = [
      { provide: getModelToken('GroupCode'), useValue: new MongoModelMock(generateIGroupCode) },
      GroupCodeService,
    ];
    const module = await setupModule(providers);
    service = module.get<GroupCodeService>(GroupCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCode', () => {
    it('should return IGroupCode', async () => {
      try {
        const groupCode = await service.generateCode(groupId);
        expect(groupCode).toBeDefined();
        expect(groupCode.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('generateCode', () => {
    it('should return IGroup', async () => {
      try {
        const group = await service.previewByCode(generateIJoinGroup().joinCode);
        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('removeCode', () => {
    it('should return void', async () => {
      try {
        const result = await service.removeCode(groupId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('updateCode', () => {
    it('should return IGroupCode', async () => {
      try {
        const groupCode = await service.updateCode(groupId);
        expect(groupCode).toBeDefined();
        expect(groupCode.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });
});
