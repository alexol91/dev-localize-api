import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class RouteLocation {
  @ApiModelProperty()
  @IsNumber()
  @Max(90)
  @Min(-90)
  lat: number;

  @ApiModelProperty()
  @IsNumber()
  @Max(180)
  @Min(-180)
  lon: number;

  @ApiModelPropertyOptional()
  @IsNumber()
  accuracy?: number;

  constructor(location: [number, number], accuracy?: number) {
    this.lat = location[1];
    this.lon = location[0];
    if (accuracy) { this.accuracy = accuracy; }
  }
}
