import { prisma } from "../db.js";

function toGeoJson(geometry) {
  return JSON.stringify(geometry);
}

export async function neighborhoodHasGeometry(neighborhoodId) {
  const rows = await prisma.$queryRaw`
    SELECT (n.geometry IS NOT NULL) AS "hasGeometry"
    FROM neighborhoods n
    WHERE n.id = ${neighborhoodId}
    LIMIT 1
  `;

  return Boolean(rows[0]?.hasGeometry);
}

export async function isPolygonWithinNeighborhood(geometry, neighborhoodId) {
  const hasGeometry = await neighborhoodHasGeometry(neighborhoodId);
  if (!hasGeometry) {
    return true;
  }

  const rows = await prisma.$queryRaw`
    SELECT ST_Within(
      ST_SetSRID(ST_GeomFromGeoJSON(${toGeoJson(geometry)}), 4326),
      n.geometry
    ) AS "isWithin"
    FROM neighborhoods n
    WHERE n.id = ${neighborhoodId}
    LIMIT 1
  `;

  return Boolean(rows[0]?.isWithin);
}

export async function polygonsOverlap(geometryA, geometryB) {
  const rows = await prisma.$queryRaw`
    SELECT ST_Intersects(
      ST_SetSRID(ST_GeomFromGeoJSON(${toGeoJson(geometryA)}), 4326),
      ST_SetSRID(ST_GeomFromGeoJSON(${toGeoJson(geometryB)}), 4326)
    ) AND NOT ST_Touches(
      ST_SetSRID(ST_GeomFromGeoJSON(${toGeoJson(geometryA)}), 4326),
      ST_SetSRID(ST_GeomFromGeoJSON(${toGeoJson(geometryB)}), 4326)
    ) AS "overlaps"
  `;

  return Boolean(rows[0]?.overlaps);
}

export async function isPointWithinZone({ latitude, longitude, zoneId }) {
  const rows = await prisma.$queryRaw`
    SELECT ST_Within(
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
      z.geometry
    ) AS "isWithin"
    FROM zones z
    WHERE z.id = ${zoneId}
    LIMIT 1
  `;

  return Boolean(rows[0]?.isWithin);
}

export async function assertZonesWithinNeighborhood(zones, neighborhoodId) {
  const hasGeometry = await neighborhoodHasGeometry(neighborhoodId);
  if (!hasGeometry) {
    return;
  }

  for (const zone of zones) {
    const within = await isPolygonWithinNeighborhood(zone.geometry, neighborhoodId);
    if (!within) {
      throw new Error(
        `Zone "${zone.code || zone.name}" extends outside the neighborhood boundary`
      );
    }
  }
}

export async function assertZonesDoNotOverlap(zones) {
  for (let i = 0; i < zones.length; i += 1) {
    for (let j = i + 1; j < zones.length; j += 1) {
      const overlaps = await polygonsOverlap(zones[i].geometry, zones[j].geometry);
      if (overlaps) {
        throw new Error(
          `Zone "${zones[i].code}" overlaps with zone "${zones[j].code}"`
        );
      }
    }
  }
}
