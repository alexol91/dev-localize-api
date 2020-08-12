import { ObjectId } from 'mongodb';

import { PlaceAlertController } from './place-alert.controller';

import { FirebaseServiceProvider } from '../../common/services/firebase.service.mock';
import { GroupsServiceProvider } from '../../db/services/groups.service.mock';
import { PlaceAlertServiceProvider } from '../../db/services/place.alert.service.mock';
import { UsersServiceProvider } from '../../db/services/users.service.mock';

import { generateTogglePlaceAlertDTO } from './dto/TogglePlaceAlert.generate';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('PlaceAlert Controller', () => {
  let controller: PlaceAlertController;
  let placeId: ObjectId;
  let userId: ObjectId;

  beforeAll(async () => {
    jest.setTimeout(10000);

    placeId = new ObjectId();
    userId = new ObjectId();

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        PlaceAlertServiceProvider,
        UsersServiceProvider,
      ],
      [PlaceAlertController],
    );
    controller = module.get<PlaceAlertController>(PlaceAlertController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('togglePlaceAlert', () => {
    it('should return void', async () => {
      try {
        const { payload } = await controller.togglePlaceAlert(userId, placeId, generateTogglePlaceAlertDTO());
        expect(payload).toBeFalsy();
      } catch (error) { fail(error); }
    });
  });
});
