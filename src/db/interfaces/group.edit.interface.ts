import { ObjectId } from 'mongodb';

export interface IEditGroup {
  readonly name?: string;
  readonly userIds?: ObjectId[];
}
