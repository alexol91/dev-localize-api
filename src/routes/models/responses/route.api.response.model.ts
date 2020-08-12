import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../common/models/api.response.model';

import { RouteLocation } from '../route.location.model';

export class RouteControllerResponse extends ControllerResponse {
  @ApiModelProperty({ type: [RouteLocation]})
  @ValidateNested({each: true})
  public payload: RouteLocation[];

  constructor(locations: RouteLocation[]) {
    super();
    this.payload = locations;
  }
}
