import { Document } from 'mongoose';

import { IPoint } from './point.interface';
import { IUser } from './user.interface';

export interface ILocation extends Document {
  id: any;
  accuracy?: number;
  point: IPoint;
  timestamp: string;
  userId: string;

  user?: IUser;
}
