import { ObjectId } from 'mongodb';

import { GroupsService } from '../services/groups.service';

import { MongoServiceMock } from './mongo.service.mock';

import { generateIGroupCode } from './groupcode.service.mock';
import { generateIMember } from './users.service.mock';

import { generateDateString, generateString } from '../../../test/helpers/generate.helper';

export const generateIGroup = (generateNested = true) => ({
  id: new ObjectId().toHexString(),
  createdAt: generateDateString(),
  name: generateString(10),

  code: generateNested ? generateIGroupCode(false) : {},
  membership: [],
  places: [],
  users: [generateIMember()],
});

export const generateIAddGroup = () => ({
  name: generateString(10),
});

export const generateIEditGroup = () => ({
  name: generateString(10),
});

export const generateIJoinGroup = () => ({
  joinCode: generateString(6),
});

export class GroupsServiceMock extends MongoServiceMock {
  constructor() {
    super(generateIGroup);
  }

  addGroup(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIGroup()));
  }

  checkIfInSameGroup(...obj): Promise<boolean> {
    return new Promise((resolve, reject) =>
      resolve(true));
  }

  editGroup(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIGroup()));
  }

  getAllGroups(...obj): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([generateIGroup(), generateIGroup()]));
  }

  getAllGroupsWithPlaces(...obj): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([generateIGroup(), generateIGroup()]));
  }

  getGroup(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIGroup()));
  }

  getGroupMembers(...obj): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([generateIMember(), generateIMember()]));
  }

  getGroupMembersWithApps(...obj): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([generateIMember(), generateIMember()]));
  }

  joinGroup(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIGroup()));
  }

  leaveGroup(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  leaveAllGroups(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  previewGroup(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIGroup()));
  }

  validateMember(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }
}

export const GroupsServiceProvider = {
  provide: GroupsService,
  useClass: GroupsServiceMock,
};
