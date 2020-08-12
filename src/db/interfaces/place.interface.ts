import { Document } from 'mongoose';

import { IGroup } from './group.interface';
import { ILocation } from './location.interface';
import { IPlaceAlert } from './place.alert.interface';
import { IPoint } from './point.interface';
import { IUser } from './user.interface';

export interface IPlace extends Document {
  id: any;
  address: string;
  groupId: string;
  name: string;
  point: IPoint;
  radius: number;
  type: string;
  userId: string;

  alert?: IPlaceAlert;
  alerts?: IPlaceAlert[];
  enteredAt?: ILocation;
  group?: IGroup;
  leftAt?: ILocation;
  user?: IUser;
}
