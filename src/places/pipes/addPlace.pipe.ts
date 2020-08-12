import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { IAddPlace } from '../../db/interfaces/place.add.interface';
import { DTOAddPlace } from '../dto/AddPlace.dto';

@Injectable()
export class AddPlacePipe implements PipeTransform {
  groupId: ObjectId;
  userId: ObjectId;

  constructor(userId: ObjectId, groupId: ObjectId) {
    this.groupId = groupId;
    this.userId = userId;
  }

  transform(value: DTOAddPlace, metadata?: ArgumentMetadata): IAddPlace {
    return {
      groupId: this.groupId,
      point: { type: 'Point', coordinates: [value.lon, value.lat] },
      userId: this.userId,
      ...value,
    };
  }
}
