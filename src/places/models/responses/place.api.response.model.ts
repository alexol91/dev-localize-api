import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../common/models/api.response.model';

import { Place } from '../../../db/models/place.model';

export class PlaceControllerResponse extends ControllerResponse {
  @ApiModelProperty()
  @ValidateNested()
  public payload: Place;

  constructor(place: Place) {
    super();
    this.payload = place;
  }
}
