import { generateNumber } from '../../../../test/helpers/generate.helper';

export const generateGooglePlaceReverseGeocodingDTO = () => ({
  lat: generateNumber(-90, 90),
  lon: generateNumber(-180, 180),
});
