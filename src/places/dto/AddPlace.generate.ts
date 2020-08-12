import { PlaceType } from '../../db/models/enum.placeType';

import { generateNumber, generateString } from '../../../test/helpers/generate.helper';

export const generateAddPlaceDTO = () => ({
  address: generateString(15),
  lat: generateNumber(-90, 90),
  lon: generateNumber(-180, 180),
  name: generateString(10),
  radius: generateNumber(30),
  type: PlaceType.home,
});
