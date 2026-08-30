export function validatePolygonGeometry(geometry) {
  if (!geometry || geometry.type !== "Polygon") {
    throw new Error("A valid Polygon geometry is required");
  }

  const ring = geometry.coordinates?.[0];

  if (!Array.isArray(ring) || ring.length < 4) {
    throw new Error("Polygon must have at least 4 coordinate points");
  }

  for (const point of ring) {
    if (!Array.isArray(point) || point.length < 2) {
      throw new Error("Each coordinate must be a [longitude, latitude] pair");
    }

    const [lng, lat] = point;

    if (typeof lng !== "number" || typeof lat !== "number") {
      throw new Error("Coordinates must be numeric longitude and latitude values");
    }

    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      throw new Error("Coordinates are out of valid longitude/latitude range");
    }
  }

  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];

  if (firstLng !== lastLng || firstLat !== lastLat) {
    throw new Error("Polygon ring must be closed (first and last points must match)");
  }

  return true;
}
