import { generateString } from '../../../../test/helpers/generate.helper';

export const generateGooglePlaceDetailsDTO = (placeId?: string) => ({
  sessiontoken: generateString(15),
  placeId: placeId || generateString(10),
});
