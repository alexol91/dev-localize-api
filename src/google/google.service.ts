import * as google from '@google/maps';
import { HttpService, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class GoogleService {
  private client: google.GoogleMapsClient;

  constructor(private readonly httpService: HttpService) {
    this.client = google.createClient({
      key: process.env.GOOGLE_MAPS_API_KEY,
    });
  }

  autocomplete(dto: google.PlaceAutocompleteRequest): Promise<google.PlaceAutocompleteResult[]> {
    return new Promise(async (resolve, reject) =>
      this.httpService.get(this.autocompleteDtoToUrl(dto)).toPromise()
        .then((res) => {
          const predictions: any[] = res.data.predictions.sort((a, b) => (a.distance_meters || 0) > (b.distance_meters || 0) ? 1 : -1);
          resolve(predictions);
        })
        .catch((err) => reject(err)));
  }

  details(dto: google.PlaceDetailsRequest): Promise<google.PlaceDetailsResult> {
    return new Promise(async (resolve, reject) =>
      this.client.place(dto, ((err, res) =>
        err ? reject(new InternalServerErrorException(err)) : resolve(res.json.result))));
  }

  reverseGeocode(dto: google.ReverseGeocodingRequest): Promise<google.GeocodingResult[]> {
    return new Promise((resolve, reject) =>
      this.client.reverseGeocode(dto, ((err, res) =>
        err ? reject(new InternalServerErrorException(err)) : resolve(res.json.results))));
  }

  private autocompleteDtoToUrl(dto: google.PlaceAutocompleteRequest) {
    const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const params: any = { ...dto, key: process.env.GOOGLE_MAPS_API_KEY };
    if (dto.location) { params.origin = dto.location; }
    return `${url}?${this.paramsToString(params)}`;
  }

  private paramsToString(params: any): string {
    return Object.keys(params).filter((k) => params[k])
      .map((k) => `${k}=${params[k]}`)
      .join('&');
  }
}
