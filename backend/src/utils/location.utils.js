export function formatLocation(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error("Latitude and longitude must be valid numbers");
  }

  if (lat < -90 || lat > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  if (lng < -180 || lng > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

export function parseLocation(location) {
  if (!location?.trim()) {
    throw new Error("GPS location is required");
  }

  const [latRaw, lngRaw] = location.split(",").map((part) => part.trim());
  const latitude = Number(latRaw);
  const longitude = Number(lngRaw);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Location must be in latitude,longitude format");
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Location coordinates are out of valid range");
  }

  return { latitude, longitude };
}
