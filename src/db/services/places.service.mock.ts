import { ObjectId } from 'mongodb';

import { PlacesService } from '../services/places.service';

import { generateIGroup } from './groups.service.mock';
import { MongoServiceMock } from './mongo.service.mock';
import { generateIUser } from './users.service.mock';

import { PlaceType } from '../models/enum.placeType';

import { generateNumber, generateString } from '../../../test/helpers/generate.helper';

const coords = (): [number, number] => [generateNumber(-180000, 180000) / 1000, generateNumber(-90000, 90000) / 1000];

export const generateIPlace = (generateNested = true) => ({
  id: new ObjectId().toHexString(),
  address: generateString(15),
  name: generateString(10),
  point: { type: 'Point', coordinates: coords() },
  radius: generateNumber(30),
  type: PlaceType.home,
  groupId: new ObjectId().toHexString(),
  userId: new ObjectId().toHexString(),

  group: generateNested ? generateIGroup(false) : {},
  user: generateNested ? generateIUser(false) : {},
});

export const generateIAddPlace = (userId: ObjectId = new ObjectId(), groupId: ObjectId = new ObjectId()) => ({
  address: generateString(15),
  name: generateString(10),
  point: { type: 'Point', coordinates: coords() },
  radius: 100,
  type: PlaceType.home,
  groupId,
  userId,
});

export const generateIEditPlace = () => ({
  name: generateString(10),
});

export class PlacesServiceMock extends MongoServiceMock {
  constructor() {
    super(generateIPlace);
  }

  addPlace(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIPlace()));
  }

  deletePlace(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  deletePlacesByGroup(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  deletePlacesByUser(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  editPlace(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve(generateIPlace()));
  }

  getAllPlaces(...obj): Promise<any> {
    return new Promise((resolve, reject) =>
      resolve([generateIPlace(), generateIPlace()]));
  }
}

export const PlacesServiceProvider = {
  provide: PlacesService,
  useClass: PlacesServiceMock,
};
