/**
 * Calculate the distance between two points using the Haversine formula
 * @param a First coordinate {lat, lng}
 * @param b Second coordinate {lat, lng}
 * @returns Distance in kilometers
 */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  
  const a1 = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));
  
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}