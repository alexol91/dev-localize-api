import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { FirebaseService } from '../common/services/firebase.service';
import { NotificationService } from '../common/services/notification.service';
import { GroupsService } from '../db/services/groups.service';
import { LocationsService } from '../db/services/locations.service';
import { UsersService } from '../db/services/users.service';

import { UserId } from '../common/decorators/user.id.decorator';
import { FirebaseTokenInterceptor } from '../common/interceptors/firebase.token.interceptor';
import { LanguageInterceptor } from '../common/interceptors/language.interceptor';
import { ObjectIdPipe } from '../common/pipes/objectId.pipe';
import { AddGroupPipe } from './pipes/addGroup.pipe';
import { EditGroupPipe } from './pipes/editGroup.pipe';

import { ControllerResponse } from '../common/models/api.response.model';
import { GroupControllerResponse } from './models/responses/group.api.response.model';
import { GroupMembersControllerResponse } from './models/responses/group.members.api.response.model';
import { GroupsControllerResponse } from './models/responses/groups.api.response.model';

import { DTOAddGroup } from './dto/AddGroup.dto';
import { DTOEditGroup } from './dto/EditGroup.dto';
import { DTOJoinGroup } from './dto/JoinGroup.dto';

import { IGroup } from '../db/interfaces/group.interface';
import { IMember } from '../db/interfaces/user.interface';
import { Group } from '../db/models/group.model';
import { Member } from '../db/models/member.model';

const validatePipeOptions = { transform: true, whitelist: true, forbidNonWhitelisted: true };

@Controller('user/groups')
@UseInterceptors(FirebaseTokenInterceptor, LanguageInterceptor)
export class GroupsController {
  constructor(
    private firebaseService: FirebaseService,
    private groupsService: GroupsService,
    private locationsService: LocationsService,
    private notificationService: NotificationService,
    private usersService: UsersService,
  ) { }

  @Get()
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: GroupsControllerResponse, description: 'Returns user groups'})
  async getAllGroups(@UserId(new ObjectIdPipe()) userId: ObjectId) {
    try {
      const groups = await this.groupsService.getAllGroups(userId);
      return this.responseWithGroups(groups, userId);
    } catch (error) { throw error; }
  }

  @Post('/add')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: GroupControllerResponse, description: 'Returns created group'})
  async addGroup(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOAddGroup,
  ) {
    try {
      const group = await this.groupsService.addGroup(userId, new AddGroupPipe().transform(dto));
      return this.responseWithGroup(group, userId);
    } catch (error) { throw error; }
  }

  @Post('/join')
  @Header('content-type', 'application/json')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: GroupControllerResponse, description: 'Joins group'})
  async joinGroup(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOJoinGroup,
  ) {
    try {
      const group = await this.groupsService.joinGroup(userId, dto.joinCode);
      this.notifyMembers(userId, new ObjectId(group.id));
      return this.responseWithGroup(group, userId);
    } catch (error) { throw error; }
  }

  @Post('/preview')
  @Header('content-type', 'application/json')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: GroupControllerResponse, description: 'Previews group'})
  async previewGroup(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOJoinGroup,
  ) {
    try {
      const group = await this.groupsService.previewGroup(dto.joinCode);
      return this.responseWithGroup(group, userId, true);
    } catch (error) { throw error; }
  }

  @Put(':id/edit')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: GroupControllerResponse, description: 'Returns updated group'})
  async editGroup(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Param('id', new ObjectIdPipe()) groupId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOEditGroup,
  ) {
    try {
      const newGroup = await (new EditGroupPipe(this.usersService, userId).transform(dto));
      await this.groupsService.validateMember(userId, groupId, true);
      const group = await this.groupsService.editGroup(userId, groupId, newGroup);
      this.notifyMembers(userId, groupId);
      return this.responseWithGroup(group, userId);
    } catch (error) { throw error; }
  }

  @Post(':id/leave')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: ControllerResponse, description: 'Leaves group'})
  async leaveGroup(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Param('id', new ObjectIdPipe()) groupId: ObjectId,
  ) {
    try {
      await this.groupsService.validateMember(userId, groupId);
      await this.groupsService.leaveGroup(userId, groupId);
      this.notifyMembers(userId, groupId);
      return new ControllerResponse();
    } catch (error) { throw error; }
  }

  @Get(':id/members')
  @Header('content-type', 'application/json')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: GroupMembersControllerResponse, description: 'Returns group members'})
  async getGroupMembers(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Param('id', new ObjectIdPipe()) groupId: ObjectId,
  ) {
    try {
      await this.groupsService.validateMember(userId, groupId);
      const members = await this.groupsService.getGroupMembers(userId, groupId);
      return this.responseWithMembers(members, userId);
    } catch (error) { throw error; }
  }

  private async notifyMembers(userId: ObjectId, groupId: ObjectId) {
    const alerteeId = userId.toHexString();
    const tokens = (await this.groupsService.getGroupMembersWithApps(groupId))
      .filter((user) => user.id !== alerteeId)
      .reduce((acc, u) => acc.concat(u.apps.map((a) => ({token: a.registrationToken, userId: new ObjectId(u.id)}))), []);
    if (tokens.length > 0) {
      this.notificationService.sendSilentNotification(tokens, {
        groupId: groupId.toHexString(),
        action: 'GROUP_UPDATE',
      });
    }
  }

  private async responseWithGroup(igroup: IGroup, requestUserId: ObjectId, preview = false): Promise<GroupControllerResponse> {
    try {
      const requestUserLocation = await this.locationsService.getLatestLocation(requestUserId);
      const group = new Group(igroup);
      group.users = igroup.users
        ? (await Promise.all(igroup.users.map(async (user) =>
            new Member(user, {
              firebaseProfile: await this.firebaseService.getUser(user.uid),
              samePerson: requestUserId.toHexString() === user.id,
              requestUserLocation,
              sameGroup: !preview,
              showAlert: !preview,
            })))).filter((u) => u.name)
        : [];

      return new GroupControllerResponse(group);
    } catch (error) { throw error; }
  }

  private async responseWithGroups(igroups: IGroup[], requestUserId: ObjectId): Promise<GroupsControllerResponse> {
    try {
      const requestUserLocation = await this.locationsService.getLatestLocation(requestUserId);
      return new GroupsControllerResponse(await Promise.all(igroups.map(async (g) => {
        const group = new Group(g);
        group.users = g.users
          ? (await Promise.all(g.users.map(async (user) =>
              new Member(user, {
                firebaseProfile: await this.firebaseService.getUser(user.uid),
                samePerson: requestUserId.toHexString() === user.id,
                sameGroup: true,
                requestUserLocation,
                showAlert: true,
              })))).filter((u) => u.name)
          : [];
        return group;
      })));
    } catch (error) { throw error; }
  }

  private async responseWithMembers(members: IMember[], requestUserId: ObjectId): Promise<GroupMembersControllerResponse> {
    try {
      const requestUserLocation = await this.locationsService.getLatestLocation(requestUserId);
      return new GroupMembersControllerResponse((await Promise.all(members.map(async (m) => new Member(m, {
        firebaseProfile: await this.firebaseService.getUser(m.uid),
        samePerson: requestUserId.toHexString() === m.id,
        sameGroup: true,
        requestUserLocation,
        showAlert: true,
      })))).filter((u) => u.name));
    } catch (error) { throw error; }
  }
}
