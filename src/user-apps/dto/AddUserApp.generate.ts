import { generateString } from '../../../test/helpers/generate.helper';

export const generateAddUserAppDTO = () => ({
  registrationToken: generateString(30),
});
