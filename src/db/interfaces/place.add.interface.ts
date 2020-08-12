import { ObjectId } from 'mongodb';

import { IPoint } from './point.interface';

import { PlaceType } from '../models/enum.placeType';

export interface IAddPlace {
  readonly address: string;
  readonly name: string;
  readonly point: IPoint;
  readonly radius: number;
  readonly type: PlaceType;

  readonly groupId: ObjectId;
  readonly userId: ObjectId;
}
