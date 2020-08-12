import { generateString } from '../../../test/helpers/generate.helper';

export const generateEditGroupDTO = () => ({
  name: generateString(10),
});
