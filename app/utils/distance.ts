export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateTotalDistance(stops: Array<{ coordinates: { lat: number; lng: number } }>): number {
  if (stops.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const current = stops[i].coordinates;
    const next = stops[i + 1].coordinates;
    totalDistance += calculateDistance(
      current.lat,
      current.lng,
      next.lat,
      next.lng
    );
  }
  
  return Math.round(totalDistance);
} 