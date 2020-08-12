import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import * as d3 from 'd3-geo';

import { ILocation } from '../interfaces/location.interface';
import { IUser } from '../interfaces/user.interface';
import { Location } from './location.model';

const METERSPERRADIAN = 6371000;

export class User {
  @ApiModelProperty()
  @IsString()
  readonly id: string;

  @ApiModelProperty()
  @IsString()
  readonly name: string;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsBoolean()
  readonly alert?: boolean;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly distanceFromUser?: number;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string;

  @ApiModelPropertyOptional()
  @IsOptional()
  @ValidateNested()
  readonly lastKnownLocation?: Location;

  constructor(
    dbUser: IUser,
    options: {
      firebaseProfile?: { imageUrl?: string, name: string },
      requestUserLocation?: ILocation,
      samePerson?: boolean,
      sameGroup?: boolean,
      showAlert?: boolean,
    } = {},
  ) {
    if (dbUser) {
      this.id = dbUser.uid;

      if (options.firebaseProfile) {
        this.imageUrl = options.firebaseProfile.imageUrl;
        this.name = options.firebaseProfile.name;
      }

      if ((options.samePerson || options.sameGroup) && dbUser.locations && dbUser.locations[0]) {
        this.lastKnownLocation = new Location(dbUser.locations[0]);

        if (!options.samePerson && options.requestUserLocation) {
          this.distanceFromUser = d3.geoDistance(dbUser.locations[0].point.coordinates, options.requestUserLocation.point.coordinates) * METERSPERRADIAN;
        }
      }

      if (options.showAlert && !options.samePerson) {
        this.alert = dbUser.alert ? dbUser.alert.enabled : true;
      }
    }
  }
}
