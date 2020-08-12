import { ApiModelProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class DTOGooglePlaceReverseGeocode {
  @ApiModelProperty()
  @IsNumber()
  @Max(90)
  @Min(-90)
  readonly lat: number;

  @ApiModelProperty()
  @IsNumber()
  @Max(180)
  @Min(-180)
  readonly lon: number;
}
