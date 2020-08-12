import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

import { ILocation } from '../interfaces/location.interface';

export class Location {
  @ApiModelProperty()
  @IsString()
  readonly id: string;

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
  @IsDateString()
  readonly timestamp: string;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly accuracy?: number;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  constructor(dbLocation: ILocation) {
    if (dbLocation) {
      this.id = dbLocation.id;
      this.accuracy = dbLocation.accuracy;
      this.timestamp = `${new Date(dbLocation.timestamp).toISOString().split('.')[0]}Z`;

      if (dbLocation.point && dbLocation.point.coordinates) {
        this.lon = dbLocation.point.coordinates[0];
        this.lat = dbLocation.point.coordinates[1];
      }
    }
  }
}
