export type Coord = { latitude: number; longitude: number };

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

function haversineMeters(a: Coord, b: Coord): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function lerpCoord(a: Coord, b: Coord, t: number): Coord {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

/** Straight-line fallback with extra points so the rider moves smoothly. */
function straightRoute(origin: Coord, destination: Coord, segments = 24): Coord[] {
  const points: Coord[] = [];
  for (let i = 0; i <= segments; i += 1) {
    points.push(lerpCoord(origin, destination, i / segments));
  }
  return points;
}

function decodeOsrmLine(coordinates: [number, number][]): Coord[] {
  return coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
}

/** Fetch a driving route that follows roads (motor/car paths). */
export async function fetchDrivingRoute(origin: Coord, destination: Coord): Promise<Coord[]> {
  const url =
    `${OSRM_BASE}/` +
    `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}` +
    '?overview=full&geometries=geojson';

  try {
    const res = await fetch(url);
    if (!res.ok) return straightRoute(origin, destination);
    const data = (await res.json()) as {
      routes?: { geometry?: { coordinates?: [number, number][] } }[];
    };
    const coords = data.routes?.[0]?.geometry?.coordinates;
    if (!coords || coords.length < 2) return straightRoute(origin, destination);
    return decodeOsrmLine(coords);
  } catch {
    return straightRoute(origin, destination);
  }
}

/** Total polyline length in meters. */
export function routeLengthMeters(route: Coord[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i += 1) {
    total += haversineMeters(route[i - 1]!, route[i]!);
  }
  return total;
}

/** Position along the route at progress 0 (origin) → 1 (destination). */
export function coordAtRouteProgress(route: Coord[], progress: number): Coord {
  if (route.length === 0) return { latitude: 0, longitude: 0 };
  if (route.length === 1 || progress <= 0) return route[0]!;
  if (progress >= 1) return route[route.length - 1]!;

  const total = routeLengthMeters(route);
  if (total <= 0) return route[0]!;

  const target = progress * total;
  let walked = 0;

  for (let i = 1; i < route.length; i += 1) {
    const segLen = haversineMeters(route[i - 1]!, route[i]!);
    if (walked + segLen >= target) {
      const t = segLen > 0 ? (target - walked) / segLen : 0;
      return lerpCoord(route[i - 1]!, route[i]!, t);
    }
    walked += segLen;
  }

  return route[route.length - 1]!;
}

/** Split route into traveled (solid) and remaining (dashed) segments. */
export function splitRouteAtProgress(
  route: Coord[],
  progress: number,
): { traveled: Coord[]; remaining: Coord[] } {
  if (route.length < 2) return { traveled: route, remaining: [] };
  const rider = coordAtRouteProgress(route, progress);
  const traveled: Coord[] = [route[0]!];
  let walked = 0;
  const total = routeLengthMeters(route);
  const target = progress * total;

  for (let i = 1; i < route.length; i += 1) {
    const segLen = haversineMeters(route[i - 1]!, route[i]!);
    if (walked + segLen < target) {
      traveled.push(route[i]!);
      walked += segLen;
    } else {
      traveled.push(rider);
      return { traveled, remaining: [rider, ...route.slice(i)] };
    }
  }

  return { traveled, remaining: [rider] };
}
