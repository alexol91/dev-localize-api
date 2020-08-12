import { ObjectId } from 'mongodb';

import { UserAppService } from './user.app.service';

import { MongoServiceMock } from './mongo.service.mock';

import { generateString } from '../../../test/helpers/generate.helper';

export const generateIUserApp = (generateNested = true) => ({
  id: new ObjectId().toHexString(),
  registrationToken: generateString(30),
});

export const generateIAddUserApp = (userId = new ObjectId()) => ({
  registrationToken: generateString(30),
  userId,
});

export class UserAppServiceMock extends MongoServiceMock {
  constructor() {
    super(generateIUserApp);
  }

  addUserApp(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  removeUserApp(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }
}

export const UserAppServiceProvider = {
  provide: UserAppService,
  useClass: UserAppServiceMock,
};
