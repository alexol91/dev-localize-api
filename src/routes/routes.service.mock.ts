import { RoutesService } from './routes.service';

import { generateDateString, generateNumber } from '../../test/helpers/generate.helper';

export const generateIRouteLocation = (generateNested = true) => ({
  lat: generateNumber(-90, 90),
  lon: generateNumber(-180, 180),
  enteredAt: new Date(generateDateString()),
  leftAt: new Date(generateDateString()),
});

export class RoutesServiceMock {
  getRouteBetween(...obj): Promise<any[]> {
    return new Promise((resolve, reject) =>
      resolve([generateIRouteLocation(), generateIRouteLocation()]));
  }
}

export const RoutesServiceProvider = {
  provide: RoutesService,
  useClass: RoutesServiceMock,
};
