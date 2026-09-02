export function formatCoordinates(latitude, longitude, { missingLabel = "—" } = {}) {
  if (latitude == null || longitude == null) {
    return missingLabel;
  }

  return `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
}

export function hasValidCoordinates(latitude, longitude) {
  return (
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude))
  );
}

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

function isPointInRing(latitude, longitude, ring) {
  if (!Array.isArray(ring) || ring.length < 3) {
    return false;
  }

  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

/** Returns true when no geometry is provided (nothing to enforce). */
export function isPointInGeometry(geometry, latitude, longitude) {
  if (!geometry) {
    return true;
  }

  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates?.[0];
    return ring ? isPointInRing(latitude, longitude, ring) : true;
  }

  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates || []).some((polygon) =>
      isPointInRing(latitude, longitude, polygon[0])
    );
  }

  return true;
}

function getPolygonSamplePoints(geometry) {
  if (!geometry || geometry.type !== "Polygon") {
    return [];
  }

  const ring = geometry.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 3) {
    return [];
  }

  const points = ring.map(([longitude, latitude]) => ({ latitude, longitude }));

  for (let i = 0; i < ring.length - 1; i += 1) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[i + 1];
    points.push({
      latitude: (lat1 + lat2) / 2,
      longitude: (lng1 + lng2) / 2,
    });
  }

  return points;
}

/** Returns true when the outer boundary is missing (nothing to enforce). */
export function isPolygonWithinGeometry(innerGeometry, outerGeometry) {
  if (!outerGeometry || !innerGeometry) {
    return true;
  }

  const samplePoints = getPolygonSamplePoints(innerGeometry);
  if (!samplePoints.length) {
    return false;
  }

  return samplePoints.every((point) =>
    isPointInGeometry(outerGeometry, point.latitude, point.longitude)
  );
}
