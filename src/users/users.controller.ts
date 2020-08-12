import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { FirebaseService } from '../common/services/firebase.service';
import { NotificationService } from '../common/services/notification.service';
import { GroupsService } from '../db/services/groups.service';
import { LocationsService } from '../db/services/locations.service';
import { UserAppService } from '../db/services/user.app.service';
import { ERRORS as USERERRORS, UsersService } from '../db/services/users.service';

import { UserId } from '../common/decorators/user.id.decorator';
import { FirebaseTokenInterceptor } from '../common/interceptors/firebase.token.interceptor';
import { LanguageInterceptor } from '../common/interceptors/language.interceptor';
import { ObjectIdPipe } from '../common/pipes/objectId.pipe';

import { ControllerResponse } from '../common/models/api.response.model';
import { UserControllerResponse } from './models/responses/user.api.response.model';

import { IGroup } from '../db/interfaces/group.interface';
import { IUserApp } from '../db/interfaces/user.app.interface';
import { IUser } from '../db/interfaces/user.interface';
import { User } from '../db/models/user.model';

export const ERRORS = {
  NOFIREBASEACCOUNT: new BadRequestException('This user has no Firebase account.'),
};

@Controller('')
@UseInterceptors(FirebaseTokenInterceptor, LanguageInterceptor)
export class UsersController {
  constructor(
    private firebaseService: FirebaseService,
    private groupsService: GroupsService,
    private locationsService: LocationsService,
    private notificationService: NotificationService,
    private userAppService: UserAppService,
    private usersService: UsersService,
  ) { }

  @Get('users/:id')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: UserControllerResponse, description: 'Returns user'})
  async getUser(
    @UserId(new ObjectIdPipe()) requestUserId: ObjectId,
    @Param('id') searchingForUserUid: string,
  ) {
    try {
      const firebaseProfile = await this.firebaseService.getUser(searchingForUserUid);
      if (!firebaseProfile) { throw ERRORS.NOFIREBASEACCOUNT; }
      let user = await this.usersService.getUserByFirebaseUid(searchingForUserUid, requestUserId);
      if (!user) { user = await this.usersService.addUser({uid: searchingForUserUid}); }
      return this.responseWithUser(user, firebaseProfile, requestUserId);
    } catch (error) { throw error; }
  }

  @Delete('user/delete')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: ControllerResponse, description: 'Deletes user'})
  async deleteUser(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
  ) {
    let groups: IGroup[];
    try {
      groups = await this.groupsService.getAllGroupsWithPlaces(userId);
      const userApps = await this.userAppService.findMany({userId});
      await this.usersService.deleteUser(userId);
      this.notifyGroupMembers(userId, groups);
      return new ControllerResponse();
    } catch (error) {
      if (error === USERERRORS.DELETEERROR) {
        this.notifyGroupMembers(userId, groups);
      } else if (error === USERERRORS.UNABLETOLEAVEGROUPS) {
        const groupsRemainedIds = (await this.groupsService.getAllGroupsWithPlaces(userId))
          .map((g) => g.id);
        this.notifyGroupMembers(userId, groups.filter((g) => !groupsRemainedIds.includes(g.id)));
      } else {
        throw error;
      }
    }
  }

  private async notifyGroupMembers(userId: ObjectId, groups: IGroup[]) {
    const alerteeId = userId.toHexString();
    const groupsToNotify = groups.filter((g) => g.users && g.users.length > 1);

    groupsToNotify.forEach((g) => {
      const usersToNotify = g.users.filter((u) => u.id !== alerteeId);

      if (usersToNotify.length > 0) {
        const tokens =  usersToNotify.reduce((uacc, u) => uacc.concat(u.apps.map((a) => ({token: a.registrationToken, userId: new ObjectId(u.id)}))), [])
          .filter((t) => t.token !== undefined);
        if (tokens.length > 0) {
          this.notificationService.sendSilentNotification(tokens, {
            groupId: g.id,
            action: 'GROUP_UPDATE',
          });
        }
      }
    }, []);
  }

  private async responseWithUser(user: IUser, firebaseProfile: any, requestUserId: ObjectId): Promise<UserControllerResponse> {
    try {
      const samePerson = requestUserId.toHexString() === user.id;
      const requestUserLocation = await this.locationsService.getLatestLocation(requestUserId);

      return new UserControllerResponse(
        new User(user, {
          firebaseProfile,
          samePerson,
          sameGroup: await this.groupsService.checkIfInSameGroup(requestUserId, new ObjectId(user.id)),
          requestUserLocation,
        }));
    } catch (error) { throw error; }
  }
}
