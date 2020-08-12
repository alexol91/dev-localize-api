import { ObjectId } from 'mongodb';

import { MembershipService } from './membership.service';

import { generateIGroup } from './groups.service.mock';
import { MongoServiceMock } from './mongo.service.mock';
import { generateIUser } from './users.service.mock';

export const generateIMembership = (generateNested = true) => ({
  id: new ObjectId().toHexString(),
  groupId: new ObjectId().toHexString(),
  userId: new ObjectId().toHexString(),
  admin: true,

  group: generateNested ? generateIGroup(false) : {},
  user: generateNested ? generateIUser(false) : {},
});

export class MembershipServiceMock extends MongoServiceMock {
  constructor() {
    super(generateIMembership);
  }

  addMember(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIMembership()));
  }

  getGroupsByUser(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve([generateIGroup(true)]));
  }

  isMember(...obj): Promise<boolean> {
    return new Promise((resolve, reject) =>
      resolve(false));
  }

  removeMembers(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  setNewAdmin(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }
}

export const MembershipServiceProvider = {
  provide: MembershipService,
  useClass: MembershipServiceMock,
};
