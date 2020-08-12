import { Document } from 'mongoose';

import { IGroup } from './group.interface';

export interface IGroupCode extends Document {
  id: any;
  createdAt: string;
  groupId: string;
  value: string;

  group?: IGroup;
}
