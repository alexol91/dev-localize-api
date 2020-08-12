import { generateBoolean } from '../../../../test/helpers/generate.helper';

export const generateToggleUserAlertDTO = (enabled = generateBoolean()) => ({
  enabled,
});
