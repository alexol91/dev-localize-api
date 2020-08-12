import { generateBoolean } from '../../../../test/helpers/generate.helper';

export const generateTogglePlaceAlertDTO = (enabled = generateBoolean()) => ({
  enabled,
});
