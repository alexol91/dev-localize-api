import { Body, Controller, Get, HttpCode, Put, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { DeviceSettingsService } from '../db/services/device.settings.service';

import { UserId } from '../common/decorators/user.id.decorator';
import { FirebaseTokenInterceptor } from '../common/interceptors/firebase.token.interceptor';
import { ObjectIdPipe } from '../common/pipes/objectId.pipe';

import { DeviceSettings } from '../db/models/device.settings.model';
import { DTOEditDeviceSettings } from './dto/EditDeviceSettings.dto';

import { DeviceSettingsControllerResponse } from './models/responses/device.settings.api.response.model';

const validatePipeOptions = { transform: true, whitelist: true, forbidNonWhitelisted: true };

@Controller('user/settings')
@UseInterceptors(FirebaseTokenInterceptor)
export class DeviceSettingsController {
  constructor(
    private deviceSettingsService: DeviceSettingsService,
  ) { }

  @Put('edit')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: DeviceSettingsControllerResponse, description: 'Returns updated settings'})
  async editDeviceSettings(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOEditDeviceSettings,
  ) {
    try {
      const settings = await this.deviceSettingsService.editDeviceSettings(userId, dto);
      return new DeviceSettingsControllerResponse(new DeviceSettings(settings));
    } catch (error) { throw error; }
  }
}
