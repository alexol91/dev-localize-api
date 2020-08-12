import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DTOGooglePlaceDetails {
  @ApiModelProperty()
  @IsString()
  readonly placeId: string;

  @ApiModelProperty()
  @IsString()
  readonly sessiontoken: string;
}
