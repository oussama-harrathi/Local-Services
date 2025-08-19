import { CityCenter } from './types';

export const CITY_CENTERS: Record<string, CityCenter> = {
  Tunis: {
    lat: 36.8065,
    lng: 10.1815,
    bounds: {
      north: 36.9,
      south: 36.7,
      east: 10.3,
      west: 10.0
    }
  },
  Sousse: {
    lat: 35.8256,
    lng: 10.6369,
    bounds: {
      north: 35.9,
      south: 35.7,
      east: 10.8,
      west: 10.5
    }
  },
  Budapest: {
    lat: 47.4979,
    lng: 19.0402,
    bounds: {
      north: 47.6,
      south: 47.4,
      east: 19.2,
      west: 18.9
    }
  }
};