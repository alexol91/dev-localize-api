import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { MongoService } from './mongo.service';

import { IGroup } from '../interfaces/group.interface';
import { IMembership } from '../interfaces/membership.interface';

@Injectable()
export class MembershipService extends MongoService<IMembership> {
  constructor(
    @InjectModel('Membership') private readonly membershipModel: Model<IMembership>,
  ) { super(membershipModel); }

  async addMember(groupId: ObjectId, userId: ObjectId, admin: boolean = false): Promise<IMembership> {
    try {
      return await this.create({groupId, userId, admin});
    } catch (error) { throw error; }
  }

  async getGroupsByUser(userId: ObjectId): Promise<IGroup[]> {
    try {
      const groups: IGroup[] = await this.aggregate([
        this.aggregateMatch({userId}),
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
            this.aggregateLookup('users', 'user', { userId: '$userId', admin: '$admin' }, this.aggregatePipeline(
              this.aggregateMatch({ $expr: { $eq: ['$_id', '$$userId'] } }),
              this.aggregateAddFields({id: '$_id', admin: '$$admin'}),

              this.aggregateLookup('locations', 'locations', { userId: '$_id' }, this.aggregatePipeline(
                this.aggregateMatch({ $expr: { $eq: ['$userId', '$$userId'] } }),
                this.aggregateSort({ timestamp: -1 }),
                this.aggregateLimit(1),
                this.aggregateAddFields({id: '$_id'}),
              )),

              this.aggregateLookup('useralerts', 'alert', { userId: '$_id' }, this.aggregatePipeline(
                this.aggregateMatch({ $expr: { $and: [
                  { $eq: ['$alertedUserId', userId] },
                  { $eq: ['$groupId', '$$groupId'] },
                  { $eq: ['$userId', '$$userId'] },
                ] }}),
                  this.aggregateAddFields({id: '$_id'}),
              )),
              this.aggregateUnwind('$alert', true),
            )),
            this.aggregateUnwind('$user'),
            this.aggregateReplaceRoot('$user'),
          )),
        )),
        this.aggregateUnwind('$group'),
        this.aggregateReplaceRoot('$group'),
      ]);

      groups.forEach((g) => {
        g.id = g.id.toString();
        g.code.id = g.code.id.toString();
        g.users.forEach((u) => {
          u.id = u.id.toString();
          if (u.locations) { u.locations.forEach((l) => l.id = l.id.toString()); }
        });
      });

      return groups;
    } catch (error) { throw error; }
  }

  async getGroupsWithPlacesByUser(userId: ObjectId): Promise<IGroup[]> {
    try {
      const groups: IGroup[] = await this.aggregate([
        this.aggregateMatch({userId}),
        this.aggregateLookup('groups', 'group', { groupId: '$groupId' }, this.aggregatePipeline(
          this.aggregateMatch({ $expr: { $eq: ['$_id', '$$groupId'] } }),
          this.aggregateAddFields({id: '$_id'}),

          this.aggregateLookup('memberships', 'users', { groupId: '$_id' }, this.aggregatePipeline(
            this.aggregateMatch({ $expr: { $eq: ['$groupId', '$$groupId'] } }),
            this.aggregateLookup('users', 'user', { userId: '$userId', admin: '$admin' }, this.aggregatePipeline(
              this.aggregateMatch({ $expr: { $eq: ['$_id', '$$userId'] } }),
              this.aggregateAddFields({id: '$_id'}),

              this.aggregateLookup('useralerts', 'alert', { userId: '$_id' }, this.aggregatePipeline(
                this.aggregateMatch({ $expr: { $and: [
                  { $eq: ['$alertedUserId', '$$userId'] },
                  { $eq: ['$groupId', '$$groupId'] },
                  { $eq: ['$userId', userId] },
                ] }}),
                  this.aggregateAddFields({id: '$_id'}),
              )),
              this.aggregateUnwind('$alert', true),

              this.aggregateLookup('userapps', 'apps', { userId: '$_id' }, this.aggregatePipeline(
                this.aggregateMatch({ $expr: { $eq: ['$userId', '$$userId'] }}),
                  this.aggregateAddFields({id: '$_id'}),
              )),
            )),

            this.aggregateUnwind('$user'),
            this.aggregateReplaceRoot('$user'),
          )),

          this.aggregateLookup('places', 'places', { groupId: '$_id' }, this.aggregatePipeline(
            this.aggregateMatch({ $expr: { $eq: ['$groupId', '$$groupId'] } }),
            this.aggregateAddFields({id: '$_id'}),

            this.aggregateLookup('placealerts', 'alerts', { placeId: '$_id'}, this.aggregatePipeline(
              this.aggregateMatch({ $expr: { $eq: ['$placeId', '$$placeId'] } }),
              this.aggregateAddFields({id: '$_id'}),
            )),
          )),
        )),
        this.aggregateUnwind('$group'),
        this.aggregateReplaceRoot('$group'),
      ]);

      groups.forEach((g) => {
        g.id = g.id.toString();
        g.places.forEach((p) => { p.id = p.id.toString(); });
        g.users.forEach((u) => {
          u.id = u.id.toString();
          if (u.apps) { u.apps.forEach((a) => a.id = a.id.toString()); }
          if (u.alert) { u.alert.id = u.alert.id.toString(); }
        });
      });

      return groups;
    } catch (error) { throw error; }
  }

  async isMember(groupId: ObjectId, userId: ObjectId): Promise<boolean> {
    try {
      return await this.findOne({groupId, userId}).then((doc) => doc !== undefined);
    } catch (error) { throw error; }
  }

  async removeMembers(groupId: ObjectId, userId: ObjectId | ObjectId[]): Promise<void> {
    try {
      await this.deleteMany({groupId, userId});
    } catch (error) { throw error; }
  }

  async setNewAdmin(userId: ObjectId, groupId: ObjectId): Promise<void>  {
    try {
      await this.membershipModel.updateOne({groupId, userId: { $ne: userId }}, {admin: true})
        .sort({createdAt: 1})
        .limit(1);
    } catch (error) { throw error; }
  }
}
