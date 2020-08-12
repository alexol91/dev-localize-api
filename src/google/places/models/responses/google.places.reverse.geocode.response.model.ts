import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../../common/models/api.response.model';
import { ReverseGeocodingGooglePlace } from '../reverse.geocoding.google.place.model';

export class ReverseGeocodingGooglePlacesControllerResponse extends ControllerResponse {
  @ApiModelProperty({type: [ReverseGeocodingGooglePlace]})
  @ValidateNested({each: true})
  public payload: ReverseGeocodingGooglePlace[];

  constructor(places: ReverseGeocodingGooglePlace[]) {
    super();
    this.payload = places;
  }
}
