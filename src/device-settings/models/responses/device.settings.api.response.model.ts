import { ApiModelProperty } from '@nestjs/swagger';

import { ControllerResponse } from '../../../common/models/api.response.model';

import { DeviceSettings } from '../../../db/models/device.settings.model';

export class DeviceSettingsControllerResponse extends ControllerResponse {
  @ApiModelProperty()
  public payload: DeviceSettings;

  constructor(settings: DeviceSettings) {
    super();
    this.payload = settings;
  }
}
