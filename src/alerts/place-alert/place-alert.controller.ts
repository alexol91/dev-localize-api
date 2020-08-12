import { Body, Controller, Header, HttpCode, Param, Post, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { PlaceAlertService } from '../../db/services/place.alert.service';

import { UserId } from '../../common/decorators/user.id.decorator';
import { FirebaseTokenInterceptor } from '../../common/interceptors/firebase.token.interceptor';
import { ObjectIdPipe } from '../../common/pipes/objectId.pipe';

import { DTOTogglePlaceAlert } from './dto/TogglePlaceAlert.dto';

import { ControllerResponse } from '../../common/models/api.response.model';

const validatePipeOptions = { transform: true, whitelist: true, forbidNonWhitelisted: true };

@Controller('alerts/places')
@UseInterceptors(FirebaseTokenInterceptor)
export class PlaceAlertController {
  constructor(private placeAlertService: PlaceAlertService) { }

  @Post(':placeId/toggle')
  @HttpCode(201)
  @Header('content-type', 'application/json')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: ControllerResponse, description: 'Toggles place alert'})
  async togglePlaceAlert(
    @UserId(new ObjectIdPipe()) userId: ObjectId,
    @Param('placeId', new ObjectIdPipe()) placeId: ObjectId,
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOTogglePlaceAlert,
  ) {
    try {
      await this.placeAlertService.togglePlaceAlert(userId, placeId, dto.enabled);
      return new ControllerResponse();
    } catch (error) { throw error; }
  }
}
