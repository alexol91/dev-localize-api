import { ApiModelProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';

import { PlaceType } from '../../db/models/enum.placeType';

export class DTOAddPlace {
  @ApiModelProperty()
  @IsString()
  readonly address: string;

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

  @ApiModelProperty()
  @IsString()
  readonly name: string;

  @ApiModelProperty()
  @IsNumber()
  @Min(0)
  readonly radius: number;

  @ApiModelProperty()
  @IsEnum(PlaceType)
  readonly type: PlaceType;
}
