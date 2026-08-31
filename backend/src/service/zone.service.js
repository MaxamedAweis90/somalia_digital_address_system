import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";
import { validatePolygonGeometry } from "../utils/geojson.utils.js";
import { validateStatus } from "../utils/validation.utils.js";

const zoneFromSql = Prisma.sql`
  FROM zones z
  INNER JOIN districts d ON d.id = z.district_id
  INNER JOIN regions r ON r.id = d.region_id
`;

async function fetchZoneById(id) {
  const rows = await prisma.$queryRaw`
    SELECT
      z.id,
      z.district_id AS "districtId",
      z.name,
      z.code,
      z.status,
      z.created_at AS "createdAt",
      z.updated_at AS "updatedAt",
      CASE
        WHEN z.geometry IS NULL THEN NULL
        ELSE ST_AsGeoJSON(z.geometry)::json
      END AS geometry,
      json_build_object(
        'id', d.id,
        'name', d.name,
        'code', d.code,
        'region', json_build_object(
          'id', r.id,
          'name', r.name,
          'code', r.code
        )
      ) AS district
    ${zoneFromSql}
    WHERE z.id = ${id}
    LIMIT 1
  `;

  if (!rows.length) {
    throw new Error("Zone not found");
  }

  return rows[0];
}

async function assertDistrictExists(districtId) {
  const district = await prisma.district.findUnique({
    where: { id: districtId },
    select: { id: true },
  });

  if (!district) {
    throw new Error("District not found");
  }
}

export const ZoneService = {
  createZone: async ({ districtId, name, code, status, geometry }) => {
    if (!districtId || !name?.trim() || !code?.trim()) {
      throw new Error("District, name, and code are required");
    }

    await assertDistrictExists(districtId);
    validateStatus(status);

    if (geometry !== undefined && geometry !== null) {
      validatePolygonGeometry(geometry);
    }

    const id = randomUUID();
    const normalizedCode = code.trim().toUpperCase();
    const normalizedStatus = status || "ACTIVE";
    const geoJson = geometry ? JSON.stringify(geometry) : null;

    await prisma.$executeRaw`
      INSERT INTO zones (
        id,
        district_id,
        name,
        code,
        status,
        geometry,
        created_at,
        updated_at
      )
      VALUES (
        ${id},
        ${districtId},
        ${name.trim()},
        ${normalizedCode},
        ${normalizedStatus}::"Status",
        ${geoJson ? Prisma.sql`ST_SetSRID(ST_GeomFromGeoJSON(${geoJson}), 4326)` : Prisma.sql`NULL`},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `;

    return fetchZoneById(id);
  },

  getZones: async (districtId) => {
    const whereClause = districtId
      ? Prisma.sql`WHERE z.district_id = ${districtId}`
      : Prisma.empty;

    return prisma.$queryRaw`
      SELECT
        z.id,
        z.district_id AS "districtId",
        z.name,
        z.code,
        z.status,
        z.created_at AS "createdAt",
        z.updated_at AS "updatedAt",
        CASE
          WHEN z.geometry IS NULL THEN NULL
          ELSE ST_AsGeoJSON(z.geometry)::json
        END AS geometry,
        json_build_object(
          'id', d.id,
          'name', d.name,
          'code', d.code,
          'region', json_build_object(
            'id', r.id,
            'name', r.name,
            'code', r.code
          )
        ) AS district
      ${zoneFromSql}
      ${whereClause}
      ORDER BY z.name ASC
    `;
  },

  getZoneById: async (id) => {
    const zone = await fetchZoneById(id);
    const counts = await prisma.zone.findUnique({
      where: { id },
      select: { _count: { select: { zoneBlocks: true, addresses: true } } },
    });

    return {
      ...zone,
      _count: counts?._count,
    };
  },

  updateZone: async (id, { districtId, name, code, status, geometry }) => {
    const existing = await prisma.zone.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Zone not found");
    }

    if (districtId) {
      await assertDistrictExists(districtId);
    }

    validateStatus(status);

    if (geometry !== undefined && geometry !== null) {
      validatePolygonGeometry(geometry);
    }

    const updates = [];

    if (districtId !== undefined) {
      updates.push(Prisma.sql`district_id = ${districtId}`);
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
      if (geometry === null) {
        updates.push(Prisma.sql`geometry = NULL`);
      } else {
        updates.push(
          Prisma.sql`geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(geometry)}), 4326)`
        );
      }
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
      include: {
        _count: { select: { zoneBlocks: true, addresses: true } },
      },
    });

    if (!zone) {
      throw new Error("Zone not found");
    }

    if (zone._count.zoneBlocks > 0 || zone._count.addresses > 0) {
      throw new Error(
        "Cannot delete zone with existing zone blocks or addresses. Remove them first."
      );
    }

    await prisma.zone.delete({ where: { id } });

    return { id };
  },
};
