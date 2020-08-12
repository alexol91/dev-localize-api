import { Body, Controller, HttpCode, Post, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { UserAppService } from '../db/services/user.app.service';

import { UserId } from '../common/decorators/user.id.decorator';
import { FirebaseTokenInterceptor } from '../common/interceptors/firebase.token.interceptor';
import { ObjectIdPipe } from '../common/pipes/objectId.pipe';

import { DTOAddUserApp } from './dto/AddUserApp.dto';
import { DTOLogoutApp } from './dto/LogoutApp.dto';

import { ControllerResponse } from '../common/models/api.response.model';
import { AddUserAppPipe } from './pipes/addUserApp.pipe';

const validatePipeOptions = { transform: true, whitelist: true, forbidNonWhitelisted: true };

@Controller('user/apps')
@UseInterceptors(FirebaseTokenInterceptor)
export class UserAppsController {
  constructor(private userAppService: UserAppService) { }

  @Post('add')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: ControllerResponse, description: 'Links device to user'})
  async addUserApp(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOAddUserApp,
  ) {
    try {
      await this.userAppService.addUserApp(new AddUserAppPipe(userId).transform(dto));
      return new ControllerResponse();
    } catch (error) { throw error; }
  }

  @Post('logout')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: ControllerResponse, description: 'Removes device from user'})
  async logoutApp(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOLogoutApp,
  ) {
    try {
      if (dto.registrationToken && dto.registrationToken.length > 0) {
        await this.userAppService.removeUserApp(userId, dto.registrationToken);
      }
      return new ControllerResponse();
    } catch (error) { throw error; }
  }
}
