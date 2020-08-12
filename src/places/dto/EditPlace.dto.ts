import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

import { PlaceType } from '../../db/models/enum.placeType';

export class DTOEditPlace {
  @ApiModelPropertyOptional()
  @IsOptional()
  @IsString()
  readonly address?: string;

  @ApiModelPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Max(90)
  @Min(-90)
  readonly lat?: number;

  @ApiModelPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Max(180)
  @Min(-180)
  readonly lon?: number;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiModelPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  readonly radius?: number;

  @ApiModelPropertyOptional()
  @IsEnum(PlaceType)
  @IsOptional()
  readonly type?: PlaceType;
}
