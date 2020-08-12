import { ObjectId } from 'mongodb';

import { RoutesController } from './routes.controller';

import { FirebaseServiceProvider } from '../common/services/firebase.service.mock';
import { GroupsServiceProvider } from '../db/services/groups.service.mock';
import { UsersServiceProvider } from '../db/services/users.service.mock';
import { RoutesServiceProvider } from './routes.service.mock';

import { generateGetRouteDTO } from './dto/GetRoute.generate';

import { generateString } from '../../test/helpers/generate.helper';
import { setupModule } from '../../test/helpers/unit.tests.helper';

describe('Routes Controller', () => {
  let controller: RoutesController;
  let userId: ObjectId;
  let userUid: string;

  beforeAll(async () => {
    jest.setTimeout(10000);

    userId = new ObjectId();
    userUid = generateString(28);

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        RoutesServiceProvider,
        UsersServiceProvider,
      ],
      [RoutesController],
    );
    controller = module.get<RoutesController>(RoutesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserRoute', () => {
    it('should return RouteLocation[]', async () => {
      try {
        const { payload: route } = await controller.getUserRoute(userId, userUid, generateGetRouteDTO());
        expect(route).toBeDefined();
        expect(Array.isArray(route)).toBeTruthy();
        expect(route.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });
});
