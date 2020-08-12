import { ILocation } from '../../db/interfaces/location.interface';

export class SimpleLocation {
  lat: number;
  lon: number;
  timestamp: Date;

  constructor(location: ILocation) {
    this.lat = location.point.coordinates[1];
    this.lon = location.point.coordinates[0];
    this.timestamp = new Date(location.timestamp);
  }
}
