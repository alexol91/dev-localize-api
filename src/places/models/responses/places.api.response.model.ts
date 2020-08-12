import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../common/models/api.response.model';

import { Place } from '../../../db/models/place.model';

export class PlacesControllerResponse extends ControllerResponse {
  @ApiModelProperty({ type: [Place]})
  @ValidateNested({each: true})
  public payload: Place[];

  constructor(places: Place[]) {
    super();
    this.payload = places;
  }
}
