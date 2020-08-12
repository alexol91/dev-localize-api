import { ObjectId } from 'mongodb';

import { LocationsService } from '../services/locations.service';

import { MongoServiceMock } from './mongo.service.mock';
import { generateIUser } from './users.service.mock';

import { generateDateString, generateNumber } from '../../../test/helpers/generate.helper';

const coords = (): [number, number] => [generateNumber(-180000, 180000) / 1000, generateNumber(-90000, 90000) / 1000];

export const generateILocation = (generateNested = true) => ({
  id: new ObjectId().toHexString(),
  accuracy: generateNumber(50),
  timestamp: generateDateString(),
  point: { type: 'Point', coordinates: coords() },
  userId: new ObjectId().toHexString(),

  user: generateNested ? generateIUser(false) : {},
});

export const generateIAddLocation = (userId: ObjectId = new ObjectId()) => ({
  accuracy: 100,
  timestamp: new Date(Date.now()).toISOString(),
  point: { type: 'Point', coordinates: coords() },
  userId,
});

export class LocationsServiceMock extends MongoServiceMock {
  constructor() {
    super(generateILocation);
  }

  addLocations(...obj): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([generateILocation(), generateILocation()]));
  }

  deleteLocations(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  getDistanceBetween(...obj): number {
    return generateNumber(1, 100);
  }

  getLatestLocation(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateILocation()));
  }

  getLocationsBetween(...obj): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([generateILocation(), generateILocation()]));
  }

  getNearLocation(...obj) {
    return new Promise((resolve, reject) =>
      resolve(generateILocation()));
  }
}

export const LocationsServiceProvider = {
  provide: LocationsService,
  useClass: LocationsServiceMock,
};
