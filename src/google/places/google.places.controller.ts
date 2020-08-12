import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { IPLocationService } from '../../common/services/iplocation.service';
import { GooglePlacesService } from './google.places.service';

import { ClientIP } from '../../common/decorators/client.ip.decorator';
import { Language } from '../../common/decorators/language.decorator';
import { ClientIPInterceptor } from '../../common/interceptors/client.ip.interceptor';
import { FirebaseTokenInterceptor } from '../../common/interceptors/firebase.token.interceptor';
import { LanguageInterceptor } from '../../common/interceptors/language.interceptor';

import { DTOGooglePlaceAutocomplete } from './dto/GooglePlaceAutocomplete.dto';
import { DTOGooglePlaceDetails } from './dto/GooglePlaceDetails.dto';
import { DTOGooglePlaceReverseGeocode } from './dto/GooglePlaceReverseGeocode.dto';

import { AutocompleteGooglePlacesControllerResponse } from './models/responses/google.places.autocomplete.response.model';
import { DetailsGooglePlacesControllerResponse } from './models/responses/google.places.details.response.model';
import { ReverseGeocodingGooglePlacesControllerResponse } from './models/responses/google.places.reverse.geocode.response.model';

const validatePipeOptions = { transform: true, whitelist: true, forbidNonWhitelisted: true };

@Controller('places')
@UseInterceptors(FirebaseTokenInterceptor, ClientIPInterceptor, LanguageInterceptor)
export class GooglePlacesController {
  constructor(
    private googlePlacesService: GooglePlacesService,
    private ipLocationService: IPLocationService,
  ) { }

  @Post('/details')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: DetailsGooglePlacesControllerResponse, description: 'Returns search results' })
  @HttpCode(200)
  async getPlaceDetails(
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOGooglePlaceDetails,
    @Language() lang: string,
  ) {
    try {
      const place = await this.googlePlacesService.getPlace(dto, lang);
      return new DetailsGooglePlacesControllerResponse(place);
    } catch (error) { throw error; }
  }

  @Post('/geocode')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: ReverseGeocodingGooglePlacesControllerResponse, description: 'Returns search results' })
  @HttpCode(200)
  async reverseGeocodePlace(
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOGooglePlaceReverseGeocode,
    @Language() lang: string,
  ) {
    try {
      const places = await this.googlePlacesService.reverseGeocoding(dto, lang);
      return new ReverseGeocodingGooglePlacesControllerResponse(places);
    } catch (error) { throw error; }
  }

  @Post('/search')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: AutocompleteGooglePlacesControllerResponse, description: 'Returns search results' })
  @HttpCode(200)
  async searchPlace(
    @Body(new ValidationPipe(validatePipeOptions)) dto: DTOGooglePlaceAutocomplete,
    @Language() lang: string,
    @ClientIP() ip,
  ) {
    try {
      let clientLocation;
      if (!(dto.lat && dto.lon)) { clientLocation = await this.ipLocationService.getLocation(ip); }
      const places = await this.googlePlacesService.searchPlace(dto, lang, clientLocation);
      return new AutocompleteGooglePlacesControllerResponse(places);
    } catch (error) { throw error; }
  }
}
