import { GooglePlacesController } from './google.places.controller';

import { FirebaseServiceProvider } from '../../common/services/firebase.service.mock';
import { IPLocationService } from '../../common/services/iplocation.service';
import { GroupsServiceProvider } from '../../db/services/groups.service.mock';
import { UsersServiceProvider } from '../../db/services/users.service.mock';
import { GooglePlacesServiceProvider } from './google.places.service.mock';

import { generateGooglePlaceAutocompleteDTO } from './dto/GooglePlaceAutocomplete.generate';
import { generateGooglePlaceDetailsDTO } from './dto/GooglePlaceDetails.generate';
import { generateGooglePlaceReverseGeocodingDTO } from './dto/GooglePlaceReverseGeocode.generate';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('Places Controller', () => {
  let controller: GooglePlacesController;

  beforeAll(async () => {
    jest.setTimeout(10000);

    const module = await setupModule(
      [
        FirebaseServiceProvider,
        GroupsServiceProvider,
        GooglePlacesServiceProvider,
        IPLocationService,
        UsersServiceProvider,
      ],
      [GooglePlacesController],
    );
    controller = module.get<GooglePlacesController>(GooglePlacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPlaceDetails', () => {
    it('should return DetailsGooglePlace', async () => {
      try {
        const { payload: place } = await controller.getPlaceDetails(generateGooglePlaceDetailsDTO(), 'en');
        expect(place).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('reverseGeocodePlace', () => {
    it('should return ReverseGeocodingGooglePlace[]', async () => {
      try {
        const { payload: places } = await controller.reverseGeocodePlace(generateGooglePlaceReverseGeocodingDTO(), 'en');
        expect(places).toBeDefined();
        expect(Array.isArray(places)).toBeTruthy();
        expect(places.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  describe('searchPlace', () => {
    it('should return AutocompleteGooglePlace[]', async () => {
      try {
        const { payload: places } = await controller.searchPlace(generateGooglePlaceAutocompleteDTO(), 'en', undefined);
        expect(places).toBeDefined();
        expect(Array.isArray(places)).toBeTruthy();
        expect(places.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });
});
