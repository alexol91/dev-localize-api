import { generateString } from '../../../test/helpers/generate.helper';

export const generateAddGroupDTO = () => ({
  name: generateString(10),
});
