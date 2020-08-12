import { Document } from 'mongoose';

import { IUser } from './user.interface';

export interface IDeviceSettings extends Document {
  id: any;
  backgroundRefresh?: string;
  forceClose?: string;
  locationPermissions?: string;
  locationServices?: string;
  powerSaveMode?: string;
  userId: string;

  user?: IUser;
}
