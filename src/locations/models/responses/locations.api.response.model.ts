import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../common/models/api.response.model';

import { Location } from '../../../db/models/location.model';

export class LocationsControllerResponse extends ControllerResponse {
  @ApiModelProperty({ type: [Location]})
  @ValidateNested({each: true})
  public payload: Location[];

  constructor(locations: Location[]) {
    super();
    this.payload = locations;
  }
}
