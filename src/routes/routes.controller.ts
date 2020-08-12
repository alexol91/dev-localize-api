import { Controller, ForbiddenException, Get, Header, HttpCode, Param, Query, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { GroupsService } from '../db/services/groups.service';
import { UsersService } from '../db/services/users.service';
import { RoutesService } from './routes.service';

import { UserId } from '../common/decorators/user.id.decorator';
import { FirebaseTokenInterceptor } from '../common/interceptors/firebase.token.interceptor';
import { ObjectIdPipe } from '../common/pipes/objectId.pipe';

import { DTOGetRoute } from './dto/GetRoute.dto';

import { RouteControllerResponse } from './models/responses/route.api.response.model';

const ERRORS = {
  NOTINSAMEGROUP: new ForbiddenException('User has no rights to view routes of this user.'),
};

const validatePipeOptions = { transform: true, whitelist: true, forbidNonWhitelisted: true };

@Controller('users/:userId/route')
@UseInterceptors(FirebaseTokenInterceptor)
export class RoutesController {
  constructor(
    private groupsService: GroupsService,
    private routesService: RoutesService,
    private usersService: UsersService,
  ) { }

  @Get()
  @HttpCode(200)
  @Header('content-type', 'application/json')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: RouteControllerResponse, description: 'Returns user route'})
  async getUserRoute(
    @UserId(new ObjectIdPipe()) requestUserId: ObjectId,
    @Param('userId') searchingForUserUid: string,
    @Query(new ValidationPipe(validatePipeOptions)) dto: DTOGetRoute,
  ) {
    try {
      const searchingForUserId = new ObjectId((await this.usersService.getUserByFirebaseUid(searchingForUserUid, requestUserId)).id);
      const sameUser = searchingForUserId.toHexString() === requestUserId.toHexString();
      const sameGroup = !sameUser && await this.groupsService.checkIfInSameGroup(requestUserId, searchingForUserId);
      if (!sameUser && !sameGroup) { throw ERRORS.NOTINSAMEGROUP; }
      const startDate = new Date(dto.date);
      const endDate = new Date(dto.date);
      endDate.setHours(endDate.getHours() + 24);
      const route = await this.routesService.getRouteBetween(searchingForUserId, startDate, endDate);
      return new RouteControllerResponse(route);
    } catch (error) { throw error; }
  }
}
