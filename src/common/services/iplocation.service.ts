import { Injectable } from '@nestjs/common';
import iplocation from 'iplocation';

@Injectable()
export class IPLocationService {
  async getLocation(ip: string): Promise<string> {
    try {
      if (!ip) { return undefined; }
      const { latitude, longitude } = await iplocation(ip);
      return latitude && longitude ? `${latitude},${longitude}` : undefined;
    } catch (error) { throw error; }
  }
}
