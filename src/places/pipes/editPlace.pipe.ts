import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { IEditPlace } from '../../db/interfaces/place.edit.interface';
import { DTOEditPlace } from '../dto/EditPlace.dto';

@Injectable()
export class EditPlacePipe implements PipeTransform {
  transform(value: DTOEditPlace, metadata?: ArgumentMetadata): IEditPlace {
    return value.lon && value.lat
      ? {...value, point: { type: 'Point', coordinates: [value.lon, value.lat] }}
      : value;
  }
}
