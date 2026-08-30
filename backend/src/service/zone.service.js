import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";
import { validatePolygonGeometry } from "../utils/geojson.utils.js";
import { validateStatus } from "../utils/validation.utils.js";

const zoneFromSql = Prisma.sql`
  FROM zones z
  INNER JOIN neighborhoods n ON n.id = z.neighborhood_id
  INNER JOIN districts d ON d.id = n.district_id
`;

async function fetchZoneById(id) {
  const rows = await prisma.$queryRaw`
    SELECT
      z.id,
      z.neighborhood_id AS "neighborhoodId",
      z.name,
      z.code,
      z.status,
      z.created_at AS "createdAt",
      z.updated_at AS "updatedAt",
      ST_AsGeoJSON(z.geometry)::json AS geometry,
      json_build_object(
        'id', n.id,
        'name', n.name,
        'code', n.code,
        'district', json_build_object(
          'id', d.id,
          'name', d.name,
          'code', d.code
        )
      ) AS neighborhood
    ${zoneFromSql}
    WHERE z.id = ${id}
    LIMIT 1
  `;

  if (!rows.length) {
    throw new Error("Zone not found");
  }

  return rows[0];
}

async function assertNeighborhoodExists(neighborhoodId) {
  const neighborhood = await prisma.neighborhood.findUnique({
    where: { id: neighborhoodId },
    select: { id: true },
  });

  if (!neighborhood) {
    throw new Error("Neighborhood not found");
  }
}

export const ZoneService = {
  createZone: async ({ neighborhoodId, name, code, status, geometry }) => {
    if (!neighborhoodId || !name?.trim() || !code?.trim()) {
      throw new Error("Neighborhood, name, and code are required");
    }

    validateStatus(status);
    validatePolygonGeometry(geometry);
    await assertNeighborhoodExists(neighborhoodId);

    const id = randomUUID();
    const normalizedCode = code.trim().toUpperCase();
    const normalizedStatus = status || "ACTIVE";
    const geoJson = JSON.stringify(geometry);

    await prisma.$executeRaw`
      INSERT INTO zones (
        id,
        neighborhood_id,
        name,
        code,
        status,
        geometry,
        created_at,
        updated_at
      )
      VALUES (
        ${id},
        ${neighborhoodId},
        ${name.trim()},
        ${normalizedCode},
        ${normalizedStatus}::"Status",
        ST_SetSRID(ST_GeomFromGeoJSON(${geoJson}), 4326),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `;

    return fetchZoneById(id);
  },

  getZones: async (neighborhoodId) => {
    const whereClause = neighborhoodId
      ? Prisma.sql`WHERE z.neighborhood_id = ${neighborhoodId}`
      : Prisma.empty;

    return prisma.$queryRaw`
      SELECT
        z.id,
        z.neighborhood_id AS "neighborhoodId",
        z.name,
        z.code,
        z.status,
        z.created_at AS "createdAt",
        z.updated_at AS "updatedAt",
        ST_AsGeoJSON(z.geometry)::json AS geometry,
        json_build_object(
          'id', n.id,
          'name', n.name,
          'code', n.code,
          'district', json_build_object(
            'id', d.id,
            'name', d.name,
            'code', d.code
          )
        ) AS neighborhood
      ${zoneFromSql}
      ${whereClause}
      ORDER BY z.name ASC
    `;
  },

  getZoneById: async (id) => fetchZoneById(id),

  updateZone: async (id, { neighborhoodId, name, code, status, geometry }) => {
    const existing = await prisma.zone.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Zone not found");
    }

    if (neighborhoodId) {
      await assertNeighborhoodExists(neighborhoodId);
    }

    validateStatus(status);

    if (geometry !== undefined) {
      validatePolygonGeometry(geometry);
    }

    const updates = [];

    if (neighborhoodId !== undefined) {
      updates.push(Prisma.sql`neighborhood_id = ${neighborhoodId}`);
    }

    if (name !== undefined) {
      updates.push(Prisma.sql`name = ${name.trim()}`);
    }

    if (code !== undefined) {
      updates.push(Prisma.sql`code = ${code.trim().toUpperCase()}`);
    }

    if (status !== undefined) {
      updates.push(Prisma.sql`status = ${status}::"Status"`);
    }

    if (geometry !== undefined) {
      updates.push(
        Prisma.sql`geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(geometry)}), 4326)`
      );
    }

    if (!updates.length) {
      return fetchZoneById(id);
    }

    updates.push(Prisma.sql`updated_at = CURRENT_TIMESTAMP`);

    await prisma.$executeRaw`
      UPDATE zones
      SET ${Prisma.join(updates, ", ")}
      WHERE id = ${id}
    `;

    return fetchZoneById(id);
  },

  deleteZone: async (id) => {
    const zone = await prisma.zone.findUnique({
      where: { id },
      select: {
        id: true,
        _count: { select: { addresses: true } },
      },
    });

    if (!zone) {
      throw new Error("Zone not found");
    }

    if (zone._count.addresses > 0) {
      throw new Error(
        "Cannot delete zone with existing addresses. Remove them first."
      );
    }

    await prisma.zone.delete({ where: { id } });

    return { id };
  },
};
