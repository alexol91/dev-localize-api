import { ObjectId } from 'mongodb';

import { MongoServiceMock } from './mongo.service.mock';
import { UserAlertService } from './user.alert.service';
import { generateIUser } from './users.service.mock';

import { generateBoolean, generateNumber } from '../../../test/helpers/generate.helper';

export const generateIUserAlert = (enabled = generateBoolean(), generateNested = true) => ({
  id: new ObjectId().toHexString(),
  distance: generateNumber(100, 10000),
  enabled,

  alertedUser: generateNested ? generateIUser(false) : {},
  user: generateNested ? generateIUser(false) : {},
});

export class UserAlertServiceMock extends MongoServiceMock {
  constructor() {
    super(generateIUserAlert);
  }

  getUserAlerts(...obj): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([generateIUserAlert()]));
  }

  toggleUserAlert(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }
}

export const UserAlertServiceProvider = {
  provide: UserAlertService,
  useClass: UserAlertServiceMock,
};
