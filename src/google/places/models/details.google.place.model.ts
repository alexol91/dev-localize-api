import { ApiModelProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Max, Min } from 'class-validator';

export class DetailsGooglePlace {
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
}
