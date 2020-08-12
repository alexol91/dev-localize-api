import { ObjectId } from 'mongodb';

import { UsersService } from '../services/users.service';

import { MongoServiceMock } from './mongo.service.mock';

import { generateString } from '../../../test/helpers/generate.helper';

export const generateIUser = (generateNested = true) => ({
  id: new ObjectId().toHexString(),
  name: generateString(10),
  uid: generateString(10),

  locations: [],
});

export const generateIMember = () => ({
  ...generateIUser(),
  admin: true,
});

export const generateIAddUser = () => ({
  uid: generateString(10),
});

export const generateUserUid = () => generateString(28);

export class UsersServiceMock extends MongoServiceMock {
  constructor() {
    super(generateIUser);
  }

  addUser(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIUser()));
  }

  deleteUser(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  editUser(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIUser()));
  }

  getUserByFirebaseUid(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIUser()));
  }
}

export const UsersServiceProvider = {
  provide: UsersService,
  useClass: UsersServiceMock,
};
