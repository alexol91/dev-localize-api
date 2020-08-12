import { Document } from 'mongoose';

import { IUser } from './user.interface';

export interface IUserApp extends Document {
  id: any;
  registrationToken: string;
  userId: string;

  user?: IUser;
}
