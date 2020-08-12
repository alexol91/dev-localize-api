export class LineStringFeature {
  constructor(private locations: number[][]) { }

  get() {
    return {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: this.locations },
    };
  }
}
