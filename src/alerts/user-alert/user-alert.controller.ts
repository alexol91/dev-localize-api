import { Body, Controller, Header, HttpCode, Param, Post, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { GroupsService } from '../../db/services/groups.service';
import { UserAlertService } from '../../db/services/user.alert.service';
import { UsersService } from '../../db/services/users.service';

import { UserId } from '../../common/decorators/user.id.decorator';
import { FirebaseTokenInterceptor } from '../../common/interceptors/firebase.token.interceptor';
import { ObjectIdPipe } from '../../common/pipes/objectId.pipe';

import { DTOToggleUserAlert } from './dto/ToggleUserAlert.dto';

import { ControllerResponse } from '../../common/models/api.response.model';

const validatePipeOptions = { transform: true, whitelist: true, forbidNonWhitelisted: true };

@Controller('alerts/groups/:groupId/users')
@UseInterceptors(FirebaseTokenInterceptor)
export class UserAlertController {
  constructor(
    private groupsService: GroupsService,
    private userAlertService: UserAlertService,
    private usersService: UsersService,
  ) { }

  @Post(':userId/toggle')
  @HttpCode(201)
  @Header('content-type', 'application/json')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: ControllerResponse, description: 'Toggles place alert'})
  async toggleUserAlert(
    @UserId(new ObjectIdPipe()) alertedUserId: ObjectId,
    @Param('groupId', new ObjectIdPipe()) groupId: ObjectId,
    @Param('userId') userUid: string,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOToggleUserAlert,
  ) {
    try {
      await this.groupsService.validateMember(alertedUserId, groupId);
      const userId = new ObjectId((await this.usersService.getUserByFirebaseUid(userUid)).id);
      await this.groupsService.validateMember(userId, groupId);
      await this.userAlertService.toggleUserAlert(alertedUserId, groupId, userId, dto.enabled);
      return new ControllerResponse();
    } catch (error) { throw error; }
  }
}
