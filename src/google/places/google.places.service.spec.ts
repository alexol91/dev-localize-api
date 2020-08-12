import { GoogleServiceProvider } from '../google.service.mock';
import { GooglePlacesService } from './google.places.service';

import { generateGooglePlaceAutocompleteDTO } from './dto/GooglePlaceAutocomplete.generate';
import { generateGooglePlaceDetailsDTO } from './dto/GooglePlaceDetails.generate';
import { generateGooglePlaceReverseGeocodingDTO } from './dto/GooglePlaceReverseGeocode.generate';

import { setupModule } from '../../../test/helpers/unit.tests.helper';

describe('GooglePlacesService', () => {
  let service: GooglePlacesService;

  beforeAll(async () => {
    jest.setTimeout(10000);

    const providers = [
      GooglePlacesService,
      GoogleServiceProvider,
    ];
    const module = await setupModule(providers);
    service = module.get<GooglePlacesService>(GooglePlacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlace', () => {
    it('should return DetailsGooglePlace', async () => {
      try {
        const place = await service.getPlace(generateGooglePlaceDetailsDTO(), 'en');
        expect(place).toBeDefined();
      } catch (error) { fail(error); }
    });
  });

  describe('reverseGeocoding', () => {
    it('should return ReverseGeocodingGooglePlace[]', async () => {
      try {
        const places = await service.reverseGeocoding(generateGooglePlaceReverseGeocodingDTO(), 'en');
        expect(places).toBeDefined();
        expect(Array.isArray(places)).toBeTruthy();
        expect(places.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });

  describe('searchPlace', () => {
    it('should return AutocompleteGooglePlace[]', async () => {
      try {
        const places = await service.searchPlace(generateGooglePlaceAutocompleteDTO(), 'en');
        expect(places).toBeDefined();
        expect(Array.isArray(places)).toBeTruthy();
        expect(places.length).toBeGreaterThan(0);
      } catch (error) { fail(error); }
    });
  });
});
