import { ObjectId } from 'mongodb';

import { GroupCodeService } from './groupcode.service';

import { generateIGroup } from './groups.service.mock';
import { MongoServiceMock } from './mongo.service.mock';

import { generateDateString, generateString } from '../../../test/helpers/generate.helper';

export const generateIGroupCode = (generateNested = true) => ({
  id: new ObjectId().toHexString(),
  createdAt: generateDateString(),
  value: generateString(6),

  group: generateNested ? generateIGroup(false) : {},
});

export class GroupCodeServiceMock extends MongoServiceMock {
  constructor() {
    super(generateIGroupCode);
  }

  generateCode(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIGroupCode()));
  }

  previewByCode(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIGroup()));
  }

  removeCode(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  updateCode(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIGroupCode()));
  }
}

export const GroupCodeServiceProvider = {
  provide: GroupCodeService,
  useClass: GroupCodeServiceMock,
};
