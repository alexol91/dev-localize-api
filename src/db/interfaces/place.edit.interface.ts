import { IPoint } from './point.interface';

import { PlaceType } from '../models/enum.placeType';

export interface IEditPlace {
  readonly address?: string;
  readonly name?: string;
  readonly point?: IPoint;
  readonly radius?: number;
  readonly type?: PlaceType;
}
