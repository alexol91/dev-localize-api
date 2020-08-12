import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as simplify from 'simplify-geojson';

import { LocationsService } from '../db/services/locations.service';

import { LineStringFeature } from './models/feature.linestring.model';
import { RouteLocation } from './models/route.location.model';
import { SimpleLocation } from './models/simple.location.model';

const TOLERANCE_RANGES = [
  0.005, 0.00475, 0.0045, 0.00425,
  0.004, 0.00375, 0.0035, 0.00325,
  0.003, 0.00275, 0.0025, 0.0024, 0.0023, 0.0022, 0.0021,
  0.002, 0.0019, 0.0018, 0.0017, 0.0016, 0.0015,  0.0014, 0.0013, 0.0012, 0.0011,
  0.001, 0.00095,
  0.0009, 0.00085,
  0.0008, 0.00075,
];

const FIRST_TIME_PERCENT_THRESHOLD = 15;
const LEAVE_20PERCENT = 5;
const LEAVE_25PERCENT = 4;

@Injectable()
export class RoutesService {
  constructor(private locationsService: LocationsService) { }

  async getRouteBetween(userId: ObjectId, startDate: Date, endDate: Date): Promise<RouteLocation[]> {
    const locations = await this.locationsService.getLocationsBetween(userId, startDate, endDate);
    const accuracies = locations.filter((l) => l.accuracy).map((l) => l.accuracy).sort((a, b) => a - b);
    // const average = accuracies.reduce( ( acc, l ) => acc + l, 0 ) / accuracies.length;
    const median = (accuracies[Math.floor((accuracies.length - 1) / 2)] + accuracies[Math.ceil((accuracies.length - 1) / 2)]) / 2;

    const simpleLocations = locations
      .map((l) => new SimpleLocation(l))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return locations.length > 0 ? this.simplifyGeolocations(simpleLocations).map((l) => new RouteLocation(l, median)) : [];
  }

  private simplifyGeolocations(locations: SimpleLocation[]): Array<[number, number]> {
    const feature = new LineStringFeature(locations.map((l) => [l.lon, l.lat])).get();

    let leavePercent;
    let simplified;
    for (const r of TOLERANCE_RANGES) {
      simplified = simplify(feature, r);
      if (!leavePercent) {
        const firstTimePercentLeft = simplified.geometry.coordinates.length  / locations.length * 100;
        leavePercent = firstTimePercentLeft > FIRST_TIME_PERCENT_THRESHOLD ? LEAVE_25PERCENT : LEAVE_20PERCENT;
      }
      if (simplified.geometry.coordinates.length > locations.length / leavePercent) {
        break;
      }
    }

    return simplified.geometry.coordinates;
  }
}
