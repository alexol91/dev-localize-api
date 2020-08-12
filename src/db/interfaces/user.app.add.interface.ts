import { ObjectId } from 'mongodb';

export interface IAddUserApp {
  readonly registrationToken: string;
  readonly userId: ObjectId;
}
