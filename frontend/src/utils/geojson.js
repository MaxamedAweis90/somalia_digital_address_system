export function isValidPolygonGeometry(geometry) {
  if (!geometry || geometry.type !== "Polygon") {
    return false;
  }

  const ring = geometry.coordinates?.[0];

  if (!Array.isArray(ring) || ring.length < 4) {
    return false;
  }

  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];

  return firstLng === lastLng && firstLat === lastLat;
}
