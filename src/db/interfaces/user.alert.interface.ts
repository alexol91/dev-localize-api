import { Document } from 'mongoose';

import { IGroup } from './group.interface';
import { IUser } from './user.interface';

export interface IUserAlert extends Document {
  id: any;
  enabled: boolean;
  alertedUserId: string;
  groupId: string;
  userId: string;

  alertedUser?: IUser;
  group?: IGroup;
  user?: IUser;
}
