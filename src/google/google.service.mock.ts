import { GoogleService } from './google.service';

import { generateNumber, generateString  } from '../../test/helpers/generate.helper';

export class GoogleServiceMock {
  autocomplete(dto: any): Promise<any[]> {
    return new Promise(async (resolve, reject) =>
      resolve([
        {
          structured_formatting: {
            main_text: generateString(10),
            secondary_text: generateString(10),
          },
          place_id: generateString(10),
        },
      ]));
  }

  details(dto: any): Promise<any> {
    return new Promise(async (resolve, reject) =>
      resolve({
        formatted_address: generateString(10),
        geometry: {
          location: {
            lat: generateNumber(-90, 90),
            lng: generateNumber(-180, 180),
          },
        },
        name: generateString(10),
      }));
  }

  reverseGeocode(dto: any): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([
        {
          formatted_address: generateString(10),
          geometry: {
            location: {
              lat: generateNumber(-90, 90),
              lng: generateNumber(-180, 180),
            },
          },
          place_id: generateString(10),
        },
      ]));
  }
}

export const GoogleServiceProvider = {
  provide: GoogleService,
  useClass: GoogleServiceMock,
};
