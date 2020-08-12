import { ObjectId } from 'mongodb';

import { PlaceAlertService } from './place.alert.service';

import { MongoServiceMock } from './mongo.service.mock';
import { generateIPlace } from './places.service.mock';
import { generateIUser } from './users.service.mock';

import { generateBoolean } from '../../../test/helpers/generate.helper';

export const generateIPlaceAlert = (enabled = generateBoolean(), generateNested = true) => ({
  id: new ObjectId().toHexString(),
  enabled,

  place: generateNested ? generateIPlace(false) : {},
  user: generateNested ? generateIUser(false) : {},
});

export class PlaceAlertServiceMock extends MongoServiceMock {
  constructor() {
    super(generateIPlaceAlert);
  }

  togglePlaceAlert(...obj): Promise<void> {
    return new Promise((resolve, reject) =>
      resolve());
  }

  getPlaceAlerts(...obj): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([generateIPlaceAlert()]));
  }
}

export const PlaceAlertServiceProvider = {
  provide: PlaceAlertService,
  useClass: PlaceAlertServiceMock,
};
