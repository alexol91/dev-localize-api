import { generateString } from '../../../../test/helpers/generate.helper';

export const generateGooglePlaceAutocompleteDTO = () => ({
  sessiontoken: generateString(15),
  text: generateString(10),
});
