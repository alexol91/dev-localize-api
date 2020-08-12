import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { GroupCodeService } from './groupcode.service';
import { MembershipService } from './membership.service';
import { MongoService } from './mongo.service';
import { PlacesService } from './places.service';
import { UserAlertService } from './user.alert.service';

import { IAddGroup } from '../interfaces/group.add.interface';
import { IEditGroup } from '../interfaces/group.edit.interface';
import { IGroup } from '../interfaces/group.interface';
import { IMember } from '../interfaces/user.interface';

export const ERRORS = {
  NOTEXIST: new NotFoundException('User doesn\'t belong to this group or group doesn\'t exist.'),
  NOTADMIN: new ForbiddenException('User has no admin rights to this group'),
  INVALIDCODE: new NotFoundException('Code is expired or invalid.'),
  ALREADYAMEMBER: new ForbiddenException('Already a member of this group.'),
};

const DAYS_BEFORE_GROUP_CODE_EXPIRATION = 4;

@Injectable()
export class GroupsService extends MongoService<IGroup> {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<IGroup>,
    private groupCodeService: GroupCodeService,
    private membershipService: MembershipService,
    private placesService: PlacesService,
    private userAlertService: UserAlertService,
  ) { super(groupModel); }

  async addGroup(userId: ObjectId, dto: IAddGroup): Promise<IGroup> {
    try {
      const groupId = new ObjectId((await this.create(dto)).id);
      await this.groupCodeService.generateCode(groupId);
      await this.membershipService.addMember(groupId, userId, true);
      return await this.getGroup(userId, groupId);
    } catch (error) { throw error; }
  }

  async checkIfInSameGroup(userId: ObjectId, userId2: ObjectId): Promise<boolean> {
    try {
      return (await this.membershipService.findMany({userId: { $in: [userId, userId2]}}))
        .map((m) => ({groupId: m.groupId.toString(), userId: m.userId.toString()}))
        .some((m, i, acc) => acc.findIndex((am) => am.userId !== m.userId && am.groupId === m.groupId) !== -1);
    } catch (error) { throw error; }
  }

  async editGroup(userId: ObjectId, groupId: ObjectId, dto: IEditGroup): Promise<IGroup> {
    try {
      const { userIds, ...remainingDTO } = dto;
      if (remainingDTO) { await this.updateOne({_id: groupId}, remainingDTO); }
      if (userIds) { await this.membershipService.removeMembers(groupId, userIds); }
      return await this.getGroup(userId, groupId);
    } catch (error) { throw error; }
  }

  async getAllGroups(userId: ObjectId): Promise<IGroup[]> {
    try {
      const groups = await this.membershipService.getGroupsByUser(userId);
      return await Promise.all<IGroup>(groups.map(async (g: IGroup) => {
        if (!this.checkCode(g.code)) { g.code = await this.groupCodeService.updateCode(new ObjectId(g.id), g.code); }
        return g;
      }));
    } catch (error) { throw error; }
  }

  async getAllGroupsWithPlaces(userId: ObjectId): Promise<IGroup[]> {
    try {
      const groups = await this.membershipService.getGroupsWithPlacesByUser(userId);

      const groupsPromises = groups.map(async (g) => {
        const placesPromises = await g.places.map(async (p) => {
          const visit = await this.placesService.getLastVisit(userId, p);
          p.enteredAt = visit.enteredAt;
          p.leftAt = visit.leftAt;
          return p;
        });

        g.places = await Promise.all(placesPromises);
        return g;
      });

      return await Promise.all(groupsPromises);
    } catch (error) { throw error; }
  }

  async getGroup(requestUserId: ObjectId, groupId: ObjectId): Promise<IGroup> {
    try {
      const group: IGroup = await this.aggregate([
        this.aggregateMatch({ $expr: { $eq: ['$_id', groupId] } }),
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
                { $eq: ['$alertedUserId', requestUserId] },
                { $eq: ['$groupId', groupId] },
                { $eq: ['$userId', '$$userId'] },
              ] }}),
                this.aggregateAddFields({id: '$_id'}),
            )),
            this.aggregateUnwind('$alert', true),
          )),
          this.aggregateUnwind('$user'),
          this.aggregateReplaceRoot('$user'),
        )),
      ], true);

      if (group) {
        group.id = group.id.toString();
        if (group.code) { group.code.id = group.code.id.toString(); }
        group.users.forEach((u) => {
          u.id = u.id.toString();
          if (u.locations) { u.locations.forEach((l) => l.id = l.id.toString()); }
          if (u.alert) { u.alert.id = u.alert.id.toString(); }
        });

        if (!this.checkCode(group.code)) { group.code = await this.groupCodeService.updateCode(groupId, group.code); }
      }

      return group;
    } catch (error) { throw error; }
  }

  async getGroupMembers(requestUserId: ObjectId, groupId: ObjectId): Promise<IMember[]> {
    try {
      const users: IMember[] = await this.aggregate([
        this.aggregateMatch({ $expr: { $eq: ['$_id', groupId] } }),

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
                { $eq: ['$alertedUserId', requestUserId] },
                { $eq: ['$groupId', groupId] },
                { $eq: ['$userId', '$$userId'] },
              ] }}),
                this.aggregateAddFields({id: '$_id'}),
            )),
            this.aggregateUnwind('$alert', true),
          )),
          this.aggregateUnwind('$user'),
          this.aggregateReplaceRoot('$user'),
        )),
        this.aggregateUnwind('$users'),
        this.aggregateReplaceRoot('$users'),
      ]);

      users.forEach((u) => {
        u.id = u.id.toString();
        if (u.locations) { u.locations.forEach((l) => l.id = l.id.toString()); }
        if (u.alert) { u.alert.id = u.alert.id.toString(); }
      });

      return users;
    } catch (error) { throw error; }
  }

  async getGroupMembersWithApps(groupId: ObjectId): Promise<IMember[]> {
    try {
      const users: IMember[] = await this.aggregate([
        this.aggregateMatch({ $expr: { $eq: ['$_id', groupId] } }),

        this.aggregateLookup('memberships', 'users', { groupId: '$_id' }, this.aggregatePipeline(
          this.aggregateMatch({ $expr: { $eq: ['$groupId', '$$groupId'] } }),
          this.aggregateLookup('users', 'user', { userId: '$userId', admin: '$admin' }, this.aggregatePipeline(
            this.aggregateMatch({ $expr: { $eq: ['$_id', '$$userId'] } }),
            this.aggregateAddFields({id: '$_id', admin: '$$admin'}),

            this.aggregateLookup('userapps', 'apps', { userId: '$_id' }, this.aggregatePipeline(
              this.aggregateMatch({ $expr: { $eq: ['$userId', '$$userId'] }}),
                this.aggregateAddFields({id: '$_id'}),
            )),
          )),
          this.aggregateUnwind('$user'),
          this.aggregateReplaceRoot('$user'),
        )),
        this.aggregateUnwind('$users'),
        this.aggregateReplaceRoot('$users'),
      ]);

      users.forEach((u) => {
        u.id = u.id.toString();
        if (u.apps) { u.apps.forEach((a) => a.id = a.id.toString()); }
      });

      return users;
    } catch (error) { throw error; }
  }

  async joinGroup(userId: ObjectId, code: string): Promise<IGroup> {
    try {
      const groupId = new ObjectId((await this.previewGroup(code)).id);
      if (await this.membershipService.isMember(groupId, userId)) { throw ERRORS.ALREADYAMEMBER; }
      await this.membershipService.create({ groupId, userId });
      return await this.getGroup(userId, groupId);
    } catch (error) { throw error; }
  }

  async leaveGroup(userId: ObjectId, groupId: ObjectId): Promise<void> {
    try {
      const group = await this.getGroup(userId, groupId);

      await Promise.all([
        this.userAlertService.deleteMany({groupId, userId}),
        this.userAlertService.deleteMany({groupId, alertedUserId: userId}),
      ]);

      const analysis = this.analyzeLeavingGroup(group, userId);
      await this.decideWhatToDoWithGroup(userId, groupId, analysis);
      await this.membershipService.removeMembers(groupId, userId);
      if (!analysis.hasStayingMembers) { await this.deleteOne({_id: groupId}); }
    } catch (error) { throw error; }
  }

  async leaveAllGroups(userId: ObjectId): Promise<void> {
    try {
      const groups = await this.membershipService.getGroupsByUser(userId);

      const membershipsToDelete: ObjectId[] = [];
      const groupsToDelete: ObjectId[] = [];
      await Promise.all(groups.map(async (g) => {
        const analysis = this.analyzeLeavingGroup(g, userId);
        const canBeDeleted = await this.decideWhatToDoWithGroup(userId, new ObjectId(g.id), analysis)
          .then(() => true)
          .catch(() => false);
        if (canBeDeleted) { membershipsToDelete.push(new ObjectId(g.id)); }
        if (!analysis.hasStayingMembers && canBeDeleted) { groupsToDelete.push(new ObjectId(g.id)); }
      }));
      if (membershipsToDelete.length > 0) {
        await this.membershipService.deleteMany({userId, groupId: { $in: membershipsToDelete }});
      }
      if (groupsToDelete.length > 0) {
        await this.deleteMany({_id: { $in: groupsToDelete }});
      }
      if (membershipsToDelete.length !== groups.length) {
        throw new InternalServerErrorException('Unable to leave some groups.');
      }
    } catch (error) { throw error; }
  }

  async previewGroup(code: string): Promise<IGroup> {
    try {
      const group = await this.groupCodeService.previewByCode(code);
      if (!group) { throw ERRORS.INVALIDCODE; }
      if (!this.checkCode(group.code)) {
        await this.groupCodeService.updateCode(new ObjectId(group.id), group.code);
        throw ERRORS.INVALIDCODE;
      }
      return group;
    } catch (error) { throw error; }
  }

  async validateMember(userId: ObjectId, groupId: ObjectId, shouldBeAdmin?: boolean): Promise<void> {
    try {
      const membership = await this.membershipService.findOne({groupId, userId});
      if (!membership) { throw ERRORS.NOTEXIST; }
      if (shouldBeAdmin && !membership.admin) { throw ERRORS.NOTADMIN; }
    } catch (error) { throw error; }
  }

  private analyzeLeavingGroup(group: IGroup, leavingId: ObjectId) {
    return {
      hasStayingMembers: group.users.some((u) => u.id !== leavingId.toHexString()),
      hasAdmins: group.users.some((u) => u.admin && u.id !== leavingId.toHexString()),
    };
  }

  private checkCode(code): boolean {
    const date = new Date();
    date.setDate(date.getDate() - DAYS_BEFORE_GROUP_CODE_EXPIRATION);
    return code && code.createdAt && new Date(code.createdAt) > date;
  }

  private async decideWhatToDoWithGroup(userId: ObjectId, groupId: ObjectId, analysis: any) {
    try {
      if (!analysis.hasStayingMembers) {
        await Promise.all([
          this.groupCodeService.removeCode(groupId)
            .catch((err) => { throw(new InternalServerErrorException('Unable to delete group code.')); }),
          this.placesService.deletePlacesByGroup(groupId)
            .catch((err) => { throw(new InternalServerErrorException('Unable to delete group places.')); }),
          this.userAlertService.deleteMany({groupId})
            .catch((err) => { throw(new InternalServerErrorException('Unable to delete group members alerts.')); }),
        ]);
      }
      if (analysis.hasStayingMembers && !analysis.hasAdmins) {
        await this.membershipService.setNewAdmin(userId, groupId)
          .catch((err) => { throw(new InternalServerErrorException('Unable to set new admin.')); });
      }
    } catch (error) { throw error; }
  }
}
