import { Document } from 'mongoose';

import { IGroupCode } from './group.code.interface';
import { IMembership } from './membership.interface';
import { IPlace } from './place.interface';
import { IMember } from './user.interface';

export interface IGroup extends Document {
  id: any;
  createdAt: string;
  name: string;

  code?: IGroupCode;
  membership?: IMembership[];
  places?: IPlace[];
  users?: IMember[];
}
