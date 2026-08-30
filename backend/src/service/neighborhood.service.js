import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";
import { validatePolygonGeometry } from "../utils/geojson.utils.js";
import { validateStatus } from "../utils/validation.utils.js";

const neighborhoodFromSql = Prisma.sql`
  FROM neighborhoods n
  INNER JOIN districts d ON d.id = n.district_id
`;

async function fetchNeighborhoodById(id) {
  const rows = await prisma.$queryRaw`
    SELECT
      n.id,
      n.district_id AS "districtId",
      n.name,
      n.code,
      n.status,
      n.created_at AS "createdAt",
      n.updated_at AS "updatedAt",
      CASE
        WHEN n.geometry IS NULL THEN NULL
        ELSE ST_AsGeoJSON(n.geometry)::json
      END AS geometry,
      json_build_object(
        'id', d.id,
        'name', d.name,
        'code', d.code
      ) AS district
    ${neighborhoodFromSql}
    WHERE n.id = ${id}
    LIMIT 1
  `;

  if (!rows.length) {
    throw new Error("Neighborhood not found");
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

export const NeighborhoodService = {
  createNeighborhood: async ({ districtId, name, code, status, geometry }) => {
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
      INSERT INTO neighborhoods (
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

    return fetchNeighborhoodById(id);
  },

  getNeighborhoods: async (districtId) => {
    const whereClause = districtId
      ? Prisma.sql`WHERE n.district_id = ${districtId}`
      : Prisma.empty;

    return prisma.$queryRaw`
      SELECT
        n.id,
        n.district_id AS "districtId",
        n.name,
        n.code,
        n.status,
        n.created_at AS "createdAt",
        n.updated_at AS "updatedAt",
        CASE
          WHEN n.geometry IS NULL THEN NULL
          ELSE ST_AsGeoJSON(n.geometry)::json
        END AS geometry,
        json_build_object(
          'id', d.id,
          'name', d.name,
          'code', d.code
        ) AS district
      ${neighborhoodFromSql}
      ${whereClause}
      ORDER BY n.name ASC
    `;
  },

  getNeighborhoodById: async (id) => {
    const neighborhood = await fetchNeighborhoodById(id);
    const counts = await prisma.neighborhood.findUnique({
      where: { id },
      select: { _count: { select: { zones: true, addresses: true } } },
    });

    return {
      ...neighborhood,
      _count: counts?._count,
    };
  },

  updateNeighborhood: async (id, { districtId, name, code, status, geometry }) => {
    const existing = await prisma.neighborhood.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Neighborhood not found");
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
      return fetchNeighborhoodById(id);
    }

    updates.push(Prisma.sql`updated_at = CURRENT_TIMESTAMP`);

    await prisma.$executeRaw`
      UPDATE neighborhoods
      SET ${Prisma.join(updates, ", ")}
      WHERE id = ${id}
    `;

    return fetchNeighborhoodById(id);
  },

  deleteNeighborhood: async (id) => {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { id },
      include: {
        _count: { select: { zones: true, addresses: true } },
      },
    });

    if (!neighborhood) {
      throw new Error("Neighborhood not found");
    }

    if (neighborhood._count.zones > 0 || neighborhood._count.addresses > 0) {
      throw new Error(
        "Cannot delete neighborhood with existing zones or addresses. Remove them first."
      );
    }

    await prisma.neighborhood.delete({ where: { id } });

    return { id };
  },
};
