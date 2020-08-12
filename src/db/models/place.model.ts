import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

import { IPlace } from '../interfaces/place.interface';
import { PlaceType } from './enum.placeType';
import { User } from './user.model';

export class Place {
  @ApiModelProperty()
  @IsString()
  readonly id: string;

  @ApiModelProperty()
  @IsString()
  readonly address: string;

  @ApiModelProperty()
  @IsDateString()
  readonly enteredAt: string;

  @ApiModelProperty()
  @IsNumber()
  @Max(90)
  @Min(-90)
  readonly lat: number;

  @ApiModelProperty()
  @IsDateString()
  readonly leftAt: string;

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

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readonly alert?: boolean;

  @ApiModelPropertyOptional()
  @IsOptional()
  creator?: User;

  constructor(
    dbPlace: IPlace,
    options: any = {},
  ) {
    if (dbPlace) {
      this.id = dbPlace.id;
      this.address = dbPlace.address;
      this.radius = dbPlace.radius;
      this.name = dbPlace.name;
      this.type = PlaceType[dbPlace.type];

      if (dbPlace.point && dbPlace.point.coordinates) {
        this.lon = dbPlace.point.coordinates[0];
        this.lat = dbPlace.point.coordinates[1];
      }

      if (dbPlace.enteredAt) {
        this.enteredAt = `${new Date(dbPlace.enteredAt.timestamp).toISOString().split('.')[0]}Z`;
      }

      if (dbPlace.leftAt) {
        this.leftAt = `${new Date(dbPlace.leftAt.timestamp).toISOString().split('.')[0]}Z`;
      }

      if (options.requestUserId) {
        this.alert = dbPlace.alert ? dbPlace.alert.enabled : true;
      }
    }
  }
}
