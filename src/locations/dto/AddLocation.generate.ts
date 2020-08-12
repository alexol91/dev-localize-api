import { generateDateString, generateNumber } from '../../../test/helpers/generate.helper';

export const generateAddLocationDTO = () => ({
  lat: generateNumber(-90, 90),
  lon: generateNumber(-180, 180),
  timestamp: generateDateString(),
});
