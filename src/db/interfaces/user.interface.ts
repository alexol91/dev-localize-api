import { Document } from 'mongoose';

import { ILocation } from './location.interface';
import { IMembership } from './membership.interface';
import { IUserAlert } from './user.alert.interface';
import { IUserApp } from './user.app.interface';

export interface IUser extends Document {
  id: any;
  uid: string;

  alert?: IUserAlert;
  apps?: IUserApp[];
  locations?: ILocation[];
  membership?: IMembership[];
}

export interface IMember extends IUser {
  admin?: boolean;
}
