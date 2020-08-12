import { generateString } from '../../../test/helpers/generate.helper';

export const generateJoinGroupDTO = () => ({
  joinCode: generateString(6),
});
