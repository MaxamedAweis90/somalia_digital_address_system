import { prisma } from "../db.js";

function toGeoJson(geometry) {
  return JSON.stringify(geometry);
}

export async function zoneHasGeometry(zoneId) {
  const rows = await prisma.$queryRaw`
    SELECT (z.geometry IS NOT NULL) AS "hasGeometry"
    FROM zones z
    WHERE z.id = ${zoneId}
    LIMIT 1
  `;

  return Boolean(rows[0]?.hasGeometry);
}

export async function districtHasGeometry(districtId) {
  const rows = await prisma.$queryRaw`
    SELECT (d.geometry IS NOT NULL) AS "hasGeometry"
    FROM districts d
    WHERE d.id = ${districtId}
    LIMIT 1
  `;

  return Boolean(rows[0]?.hasGeometry);
}

export async function isPolygonWithinZone(geometry, zoneId) {
  const hasGeometry = await zoneHasGeometry(zoneId);
  if (!hasGeometry) {
    return true;
  }

  const rows = await prisma.$queryRaw`
    SELECT ST_Within(
      ST_SetSRID(ST_GeomFromGeoJSON(${toGeoJson(geometry)}), 4326),
      z.geometry
    ) AS "isWithin"
    FROM zones z
    WHERE z.id = ${zoneId}
    LIMIT 1
  `;

  return Boolean(rows[0]?.isWithin);
}

export async function isPolygonWithinDistrict(geometry, districtId) {
  const hasGeometry = await districtHasGeometry(districtId);
  if (!hasGeometry) {
    return true;
  }

  const rows = await prisma.$queryRaw`
    SELECT ST_Within(
      ST_SetSRID(ST_GeomFromGeoJSON(${toGeoJson(geometry)}), 4326),
      d.geometry
    ) AS "isWithin"
    FROM districts d
    WHERE d.id = ${districtId}
    LIMIT 1
  `;

  return Boolean(rows[0]?.isWithin);
}

export async function assertPolygonWithinDistrictIfBounded({ geometry, districtId }) {
  if (!geometry) {
    return;
  }

  const hasGeometry = await districtHasGeometry(districtId);
  if (!hasGeometry) {
    return;
  }

  const within = await isPolygonWithinDistrict(geometry, districtId);
  if (!within) {
    throw new Error("Zone boundary must stay inside the selected district boundary");
  }
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

export async function isPointWithinZoneBlock({ latitude, longitude, zoneBlockId }) {
  const rows = await prisma.$queryRaw`
    SELECT ST_Within(
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
      zb.geometry
    ) AS "isWithin"
    FROM zone_blocks zb
    WHERE zb.id = ${zoneBlockId}
    LIMIT 1
  `;

  return Boolean(rows[0]?.isWithin);
}

export async function zoneBlockHasGeometry(zoneBlockId) {
  const rows = await prisma.$queryRaw`
    SELECT (zb.geometry IS NOT NULL) AS "hasGeometry"
    FROM zone_blocks zb
    WHERE zb.id = ${zoneBlockId}
    LIMIT 1
  `;

  return Boolean(rows[0]?.hasGeometry);
}

export async function assertPointWithinZoneBlockIfBounded({
  latitude,
  longitude,
  zoneBlockId,
}) {
  const hasGeometry = await zoneBlockHasGeometry(zoneBlockId);
  if (!hasGeometry) {
    return;
  }

  const within = await isPointWithinZoneBlock({ latitude, longitude, zoneBlockId });
  if (!within) {
    throw new Error("GPS location must be inside the selected zone block boundary");
  }
}

export async function assertZoneBlocksWithinZone(zoneBlocks, zoneId) {
  const hasGeometry = await zoneHasGeometry(zoneId);
  if (!hasGeometry) {
    return;
  }

  for (const zoneBlock of zoneBlocks) {
    const within = await isPolygonWithinZone(zoneBlock.geometry, zoneId);
    if (!within) {
      throw new Error(
        `Zone block "${zoneBlock.code || zoneBlock.name}" extends outside the zone boundary`
      );
    }
  }
}

export async function assertZoneBlocksDoNotOverlap(zoneBlocks) {
  for (let i = 0; i < zoneBlocks.length; i += 1) {
    for (let j = i + 1; j < zoneBlocks.length; j += 1) {
      const overlaps = await polygonsOverlap(zoneBlocks[i].geometry, zoneBlocks[j].geometry);
      if (overlaps) {
        throw new Error(
          `Zone block "${zoneBlocks[i].code}" overlaps with zone block "${zoneBlocks[j].code}"`
        );
      }
    }
  }
}
