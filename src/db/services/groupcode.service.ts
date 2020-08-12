import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { MongoService } from './mongo.service';

import { IGroupCode } from '../interfaces/group.code.interface';
import { IGroup } from '../interfaces/group.interface';

export const ERRORS = {
  EXCEEDEDCODERETRIES: new BadRequestException('Code wasn\'t generated.'),
};

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
const MAX_GENERATE_CODE_RETRIES = 10;

@Injectable()
export class GroupCodeService extends MongoService<IGroupCode> {
  constructor(
    @InjectModel('GroupCode') private readonly groupcodeModel: Model<IGroupCode>,
  ) { super(groupcodeModel); }

  async generateCode(groupId: ObjectId, retries: number = 0): Promise<IGroupCode> {
    try {
      return await this.create({groupId, value: this.generate()})
        .catch(async (err) => {
          if (retries >= MAX_GENERATE_CODE_RETRIES) { throw ERRORS.EXCEEDEDCODERETRIES; }
          return await this.generateCode(groupId, retries + 1);
        });
    } catch (error) { throw error; }
  }

  async previewByCode(code: string): Promise<IGroup> {
    try {
      const group: IGroup = await this.aggregate([
        this.aggregateMatch({value: code}),
        this.aggregateLookup('groups', 'group', { groupId: '$groupId' }, this.aggregatePipeline(
          this.aggregateMatch({ $expr: { $eq: ['$_id', '$$groupId'] } }),
          this.aggregateAddFields({id: '$_id'}),

          this.aggregateLookup('groupcodes', 'code', { groupId: '$_id' }, this.aggregatePipeline(
            this.aggregateMatch({ $expr: { $eq: ['$groupId', '$$groupId'] } }),
            this.aggregateAddFields({id: '$_id'}),
          )),
          this.aggregateUnwind('$code'),

          this.aggregateLookup('memberships', 'users', { groupId: '$_id' }, this.aggregatePipeline(
            this.aggregateMatch({ $expr: { $eq: ['$groupId', '$$groupId'] } }),
            this.aggregateSort({ createdAt: -1 }),
            this.aggregateLimit(4),
            this.aggregateLookup('users', 'user', { userId: '$userId', admin: '$admin' }, this.aggregatePipeline(
              this.aggregateMatch({ $expr: { $eq: ['$_id', '$$userId'] } }),
              this.aggregateAddFields({id: '$_id', admin: '$$admin'}),
            )),
            this.aggregateUnwind('$user'),
            this.aggregateReplaceRoot('$user'),
          )),
        )),
        this.aggregateUnwind('$group'),
        this.aggregateReplaceRoot('$group'),
      ], true);

      if (group) {
        group.id = group.id.toString();
        if (group.code) { group.code.id = group.code.id.toString(); }
        if (group.users) { group.users.forEach((u) => u.id = u.id.toString()); }
      }

      return group;
    } catch (error) { throw error; }
  }

  async removeCode(groupId: ObjectId): Promise<void> {
    try {
      await this.deleteOne({groupId});
    } catch (error) { throw error; }
  }

  async updateCode(groupId: ObjectId, code?: IGroupCode): Promise<IGroupCode> {
    try {
      if (code) { await this.deleteOne({groupId}); }
      return await this.generateCode(groupId);
    } catch (error) { throw error; }
  }

  private generate(): string {
    return Array.apply(null, Array(6))
      .map(() => ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length)))
      .join('');
  }
}
