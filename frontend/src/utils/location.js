export function parseLocation(location) {
  if (!location) return null;

  const [latRaw, lngRaw] = location.split(",").map((part) => part.trim());
  const latitude = Number(latRaw);
  const longitude = Number(lngRaw);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

export function formatLocationLabel(location) {
  const coords = parseLocation(location);
  if (!coords) return "—";

  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}
