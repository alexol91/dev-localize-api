import { GooglePlacesService } from './google.places.service';

import { generateNumber, generateString  } from '../../../test/helpers/generate.helper';

export class GooglePlacesServiceMock {
  getPlace(dto: any): Promise<any> {
    return new Promise(async (resolve, reject) =>
      resolve({
        address: generateString(10),
        lat: generateNumber(-90, 90),
        lon: generateNumber(-180, 180),
        name: generateString(10),
      }));
  }

  reverseGeocoding(dto: any): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([
        {
          address: generateString(10),
          lat: generateNumber(-90, 90),
          lon: generateNumber(-180, 180),
          name: generateString(10),
        },
      ]));
  }

  searchPlace(dto: any): Promise<any[]> {
    return new Promise(async (resolve, reject) =>
      resolve([
        {
          address: generateString(10),
          name: generateString(10),
          placeId: generateString(10),
        },
      ]));
  }
}

export const GooglePlacesServiceProvider = {
  provide: GooglePlacesService,
  useClass: GooglePlacesServiceMock,
};
