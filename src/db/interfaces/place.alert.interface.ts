import { Document } from 'mongoose';

import { IPlace } from './place.interface';
import { IUser } from './user.interface';

export interface IPlaceAlert extends Document {
  id: any;
  enabled: boolean;
  placeId: string;
  userId: string;

  place?: IPlace;
  user?: IUser;
}
