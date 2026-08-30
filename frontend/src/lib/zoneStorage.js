const STORAGE_KEY = "sdas_zones";

function readZones() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeZones(zones) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
}

export function getAllZones() {
  return readZones();
}

export function getZoneById(id) {
  return readZones().find((zone) => zone.id === id) || null;
}

export function createZone(payload) {
  const zones = readZones();
  const now = new Date().toISOString();

  const zone = {
    id: crypto.randomUUID(),
    ...payload,
    createdAt: now,
    updatedAt: now,
  };

  zones.push(zone);
  writeZones(zones);

  return zone;
}

export function updateZone(id, payload) {
  const zones = readZones();
  const index = zones.findIndex((zone) => zone.id === id);

  if (index === -1) {
    throw new Error("Zone not found");
  }

  const updated = {
    ...zones[index],
    ...payload,
    id,
    updatedAt: new Date().toISOString(),
  };

  zones[index] = updated;
  writeZones(zones);

  return updated;
}

export function deleteZone(id) {
  const zones = readZones();
  const next = zones.filter((zone) => zone.id !== id);

  if (next.length === zones.length) {
    throw new Error("Zone not found");
  }

  writeZones(next);
  return { id };
}
