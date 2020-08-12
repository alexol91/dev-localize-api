import { GeocodingResult, PlaceAutocompleteRequest, PlaceAutocompleteResult, PlaceDetailsRequest, PlaceDetailsResult, ReverseGeocodingRequest } from '@google/maps';
import { Injectable } from '@nestjs/common';

import { GoogleService } from '../google.service';

import { AutocompleteGooglePlace } from './models/autocomplete.google.place.model';
import { DetailsGooglePlace } from './models/details.google.place.model';
import { ReverseGeocodingGooglePlace } from './models/reverse.geocoding.google.place.model';

import { DTOGooglePlaceAutocomplete } from './dto/GooglePlaceAutocomplete.dto';
import { DTOGooglePlaceDetails } from './dto/GooglePlaceDetails.dto';
import { DTOGooglePlaceReverseGeocode } from './dto/GooglePlaceReverseGeocode.dto';

@Injectable()
export class GooglePlacesService {

  constructor(private googleService: GoogleService) {}

  getPlace(dto: DTOGooglePlaceDetails, lang: string): Promise<DetailsGooglePlace> {
    return new Promise((resolve, reject) => {
      this.googleService.details(this.formatPlaceDetailsDTO(dto, lang))
        .then((resp) => resolve(this.formatPlaceDetailsResponse(resp)))
        .catch((err) => reject(err));
    });
  }

  reverseGeocoding(dto: DTOGooglePlaceReverseGeocode, lang: string): Promise<ReverseGeocodingGooglePlace[]> {
    return new Promise((resolve, reject) => {
      this.googleService.reverseGeocode(this.formatPlaceReverseGeocodeDTO(dto, lang))
        .then((resp) => resolve(this.formatPlaceReverseGeocodeResponse(resp)))
        .catch((err) => reject(err));
    });
  }

  searchPlace(dto: DTOGooglePlaceAutocomplete, lang: string, clientLocation?: string): Promise<AutocompleteGooglePlace[]> {
    return new Promise((resolve, reject) => {
      this.googleService.autocomplete(this.formatPlaceAutocompleteDTO(dto, lang, clientLocation))
        .then((resp) => resolve(this.formatPlaceAutocompleteResponse(resp)))
        .catch((err) => reject(err));
    });
  }

  private formatPlaceAutocompleteDTO(dto: DTOGooglePlaceAutocomplete, lang: any, clientLocation?: string): PlaceAutocompleteRequest {
    const req: PlaceAutocompleteRequest = {
      language: lang,
      input: encodeURI(dto.text),
      sessiontoken: dto.sessiontoken,
    };
    if (dto.lon && dto.lat) {
      req.location = `${dto.lat},${dto.lon}`;
      req.radius = 5000;
    } else if (clientLocation) {
      req.location = clientLocation;
      req.radius = 5000;
    }
    return req;
  }

  private formatPlaceAutocompleteResponse(results: PlaceAutocompleteResult[]): AutocompleteGooglePlace[] {
    return results.map((r) => ({
      address: r.structured_formatting.secondary_text,
      name: r.structured_formatting.main_text,
      placeId: r.place_id,
    }));
  }

  private formatPlaceDetailsDTO(dto: DTOGooglePlaceDetails, lang: any): PlaceDetailsRequest {
    return {
      language: lang,
      placeid: dto.placeId,
      sessiontoken: dto.sessiontoken,
    };
  }

  private formatPlaceDetailsResponse(result: PlaceDetailsResult): DetailsGooglePlace {
    return {
      address: result.formatted_address,
      lat: result.geometry.location.lat,
      lon: result.geometry.location.lng,
      name: result.name,
    };
  }

  private formatPlaceReverseGeocodeDTO(dto: DTOGooglePlaceReverseGeocode, lang: any): ReverseGeocodingRequest {
    return {
      language: lang,
      latlng: `${dto.lat},${dto.lon}`,
    };
  }

  private formatPlaceReverseGeocodeResponse(results: GeocodingResult[]): ReverseGeocodingGooglePlace[] {
    return results.map((r) => ({
      address: r.formatted_address,
      lat: r.geometry.location.lat,
      lon: r.geometry.location.lng,
      name: r.formatted_address,
    }));
  }
}
