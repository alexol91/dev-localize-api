import { generateString } from '../../../test/helpers/generate.helper';

export const generateLogoutAppDTO = () => ({
  registrationToken: generateString(30),
});
