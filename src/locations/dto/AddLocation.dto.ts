import { ApiModelProperty } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class DTOAddLocation {
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
  @IsISO8601()
  readonly timestamp: string;

  @ApiModelProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly accuracy?: number;
}
