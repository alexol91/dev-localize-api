import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { IAddLocation } from '../../db/interfaces/location.add.interface';
import { DTOAddLocation } from '../dto/AddLocation.dto';

@Injectable()
export class AddLocationPipe implements PipeTransform {
  userId: ObjectId;

  constructor(userId: ObjectId) {
    this.userId = userId;
  }

  transform(value: DTOAddLocation | DTOAddLocation[], metadata?: ArgumentMetadata): IAddLocation[] {
    if (!Array.isArray(value)) { value = [value]; }
    return value.map((l) => ({
      point: { type: 'Point', coordinates: [l.lon, l.lat] },
      userId: this.userId,
      ...l,
    }));
  }
}
