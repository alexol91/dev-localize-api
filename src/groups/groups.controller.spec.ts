import { ObjectId } from 'mongodb';

import { GroupsController } from './groups.controller';

import { FirebaseServiceProvider } from '../common/services/firebase.service.mock';
import { NotificationServiceProvider } from '../common/services/notification.service.mock';
import { GroupsServiceProvider } from '../db/services/groups.service.mock';
import { LocationsServiceProvider } from '../db/services/locations.service.mock';
import { UsersServiceProvider } from '../db/services/users.service.mock';

import { generateAddGroupDTO } from './dto/AddGroup.generate';
import { generateEditGroupDTO } from './dto/EditGroup.generate';
import { generateJoinGroupDTO } from './dto/JoinGroup.generate';

import { setupModule } from '../../test/helpers/unit.tests.helper';

describe('Places Controller', () => {
  let controller: GroupsController;
  let groupId: ObjectId;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    groupId = new ObjectId();
    userId = new ObjectId();

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        LocationsServiceProvider,
        NotificationServiceProvider,
        UsersServiceProvider,
      ],
      [GroupsController],
    );
    controller = module.get<GroupsController>(GroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addGroup', () => {
    it('should return Group', async () => {
      try {
        const { payload: group } = await controller.addGroup(userId, generateAddGroupDTO());
        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('editGroup', () => {
    it('should return Group', async () => {
      try {
        const { payload: group } = await controller.editGroup(userId, groupId, generateEditGroupDTO());
        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('getAllGroups', () => {
    it('should return Group[]', async () => {
      try {
        const { payload: groups } = await controller.getAllGroups(userId);
        expect(groups).toBeDefined();
        expect(Array.isArray(groups)).toBeTruthy();
        expect(groups.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  describe('getGroupMembers', () => {
    it('should return User[]', async () => {
      try {
        const { payload: users } = await controller.getGroupMembers(userId, groupId);
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBeTruthy();
        expect(users.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  describe('joinGroup', () => {
    it('should return Group', async () => {
      try {
        const { payload: group } = await controller.joinGroup(userId, generateJoinGroupDTO());
        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('leaveGroup', () => {
    it('should return void', async () => {
      try {
        const { payload } = await controller.leaveGroup(userId, groupId);
        expect(payload).toBeFalsy();
      } catch (error) { fail(error); }
    });
  });

  describe('previewGroup', () => {
    it('should return Group', async () => {
      try {
        const { payload: group } = await controller.previewGroup(userId, generateJoinGroupDTO());
        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
      } catch (error) { fail(error); }
    });
  });
});
