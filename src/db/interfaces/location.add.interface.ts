import { ObjectId } from 'mongodb';

import { IPoint } from './point.interface';

export interface IAddLocation {
  readonly accuracy?: number;
  readonly point: IPoint;
  readonly timestamp: string;

  readonly userId: ObjectId;
}
