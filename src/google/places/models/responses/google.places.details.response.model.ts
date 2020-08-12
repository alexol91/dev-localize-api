import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../../common/models/api.response.model';
import { DetailsGooglePlace } from '../details.google.place.model';

export class DetailsGooglePlacesControllerResponse extends ControllerResponse {
  @ApiModelProperty()
  @ValidateNested({each: true})
  public payload: DetailsGooglePlace;

  constructor(details: DetailsGooglePlace) {
    super();
    this.payload = details;
  }
}
