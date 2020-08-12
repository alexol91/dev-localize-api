import { Document } from 'mongoose';

import { IGroup } from './group.interface';
import { IUser } from './user.interface';

export interface IMembership extends Document {
  id: any;
  groupId: string;
  userId: string;

  admin?: boolean;
  group?: IGroup;
  user?: IUser;
}
