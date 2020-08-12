import { ApiModelProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ControllerResponse } from '../../../../common/models/api.response.model';
import { AutocompleteGooglePlace } from '../autocomplete.google.place.model';

export class AutocompleteGooglePlacesControllerResponse extends ControllerResponse {
  @ApiModelProperty({type: [AutocompleteGooglePlace]})
  @ValidateNested({each: true})
  public payload: AutocompleteGooglePlace[];

  constructor(places: AutocompleteGooglePlace[]) {
    super();
    this.payload = places;
  }
}
