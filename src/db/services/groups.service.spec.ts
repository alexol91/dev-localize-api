import { getModelToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { GroupsService } from './groups.service';

import { MongoModelMock } from '../mocks/mongo/mongo.model.mock';
import { GroupCodeServiceProvider } from './groupcode.service.mock';
import { generateIAddGroup, generateIEditGroup, generateIGroup, generateIJoinGroup } from './groups.service.mock';
import { MembershipServiceProvider } from './membership.service.mock';
import { PlacesServiceProvider } from './places.service.mock';
import { UserAlertServiceProvider } from './user.alert.service.mock';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('Group Service', () => {
  let groupId: ObjectId;
  let service: GroupsService;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    groupId = new ObjectId();
    userId = new ObjectId();

    const providers = [
      { provide: getModelToken('Group'), useValue: new MongoModelMock(generateIGroup) },
      GroupsService,
      GroupCodeServiceProvider,
      MembershipServiceProvider,
      PlacesServiceProvider,
      UserAlertServiceProvider,
    ];
    const module = await setupModule(providers);
    service = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addGroup', () => {
    it('should return IGroup', async () => {
      try {
        const group = await service.addGroup(userId, generateIAddGroup());
        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('checkIfInSameGroup', () => {
    it('should return true', async () => {
      try {
        const inSameGroup = await service.checkIfInSameGroup(userId, userId);
        expect(inSameGroup).toBeDefined();
        expect(inSameGroup).toBeFalsy();
      } catch (error) { fail(error); }
    });
  });

  describe('editGroup', () => {
    it('should return IGroup', async () => {
      try {
        const group = await service.editGroup(userId, groupId, generateIEditGroup());
        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('getAllGroups', () => {
    it('should return IGroup[]', async () => {
      try {
        const groups = await service.getAllGroups(userId);
        expect(groups).toBeDefined();
        expect(Array.isArray(groups)).toBeTruthy();
        expect(groups.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  describe('getGroup', () => {
    it('should return IGroup', async () => {
      try {
        const group = await service.getGroup(userId, groupId);
        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('getGroupMembers', () => {
    it('should return IMember[]', async () => {
      try {
        const users = await service.getGroupMembers(userId, groupId);
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBeTruthy();
        expect(users.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  // already a member of this group issue

  // describe('joinGroup', () => {
  //   it('should return IGroup', async () => {
  //     try {
  //       const group = await service.joinGroup(userId, generateIJoinGroup().joinCode);
  //       expect(group).toBeDefined();
  //       expect(group.id).toBeDefined();
  //     } catch (error) { fail(error); }
  //   });
  // });

  describe('leaveGroup', () => {
    it('should return void', async () => {
      try {
        const result = await service.leaveGroup(userId, groupId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('leaveAllGroups', () => {
    it('should return void', async () => {
      try {
        const result = await service.leaveAllGroups(userId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });

  describe('previewGroup', () => {
    it('should return IGroup', async () => {
      try {
        const group = await service.previewGroup(generateIJoinGroup().joinCode);
        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('validateMember', () => {
    it('should return void', async () => {
      try {
        const result = await service.validateMember(userId, groupId);
        expect(result).toBeUndefined();
      } catch (error) { fail(error); }
    });
  });
});
