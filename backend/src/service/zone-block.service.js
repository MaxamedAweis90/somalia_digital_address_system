import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";
import { validatePolygonGeometry } from "../utils/geojson.utils.js";
import { validateStatus } from "../utils/validation.utils.js";

const zoneBlockFromSql = Prisma.sql`
  FROM zone_blocks zb
  INNER JOIN zones z ON z.id = zb.zone_id
  INNER JOIN districts d ON d.id = z.district_id
`;

async function fetchZoneBlockById(id) {
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Zone block ID is required");
  }

  const cleanId = id.trim();
  const rows = await prisma.$queryRaw`
    SELECT
      zb.id,
      zb.zone_id AS "zoneId",
      zb.name,
      zb.code,
      zb.status,
      zb.created_at AS "createdAt",
      zb.updated_at AS "updatedAt",
      ST_AsGeoJSON(zb.geometry)::json AS geometry,
      json_build_object(
        'id', z.id,
        'name', z.name,
        'code', z.code,
        'district', json_build_object(
          'id', d.id,
          'name', d.name,
          'code', d.code
        )
      ) AS zone
    ${zoneBlockFromSql}
    WHERE zb.id = ${cleanId}
    LIMIT 1
  `;

  if (!rows.length) {
    throw new Error("Zone block not found");
  }

  return rows[0];
}

async function assertZoneExists(zoneId) {
  if (!zoneId || typeof zoneId !== "string" || !zoneId.trim()) {
    throw new Error("Zone ID is required");
  }

  const zone = await prisma.zone.findUnique({
    where: { id: zoneId.trim() },
    select: { id: true },
  });

  if (!zone) {
    throw new Error("Zone not found");
  }
}

export const ZoneBlockService = {
  createZoneBlock: async ({ zoneId, name, code, status, geometry }) => {
    if (!zoneId || !name?.trim() || !code?.trim()) {
      throw new Error("Zone, name, and code are required");
    }

    validateStatus(status);
    validatePolygonGeometry(geometry);
    await assertZoneExists(zoneId);

    const id = randomUUID();
    const normalizedCode = code.trim().toUpperCase();
    const normalizedStatus = status || "ACTIVE";
    const geoJson = JSON.stringify(geometry);

    await prisma.$executeRaw`
      INSERT INTO zone_blocks (
        id,
        zone_id,
        name,
        code,
        status,
        geometry,
        created_at,
        updated_at
      )
      VALUES (
        ${id},
        ${zoneId},
        ${name.trim()},
        ${normalizedCode},
        ${normalizedStatus}::"Status",
        ST_SetSRID(ST_GeomFromGeoJSON(${geoJson}), 4326),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `;

    return fetchZoneBlockById(id);
  },

  getZoneBlocks: async (zoneId) => {
    const whereClause = zoneId
      ? Prisma.sql`WHERE zb.zone_id = ${zoneId}`
      : Prisma.empty;

    return prisma.$queryRaw`
      SELECT
        zb.id,
        zb.zone_id AS "zoneId",
        zb.name,
        zb.code,
        zb.status,
        zb.created_at AS "createdAt",
        zb.updated_at AS "updatedAt",
        ST_AsGeoJSON(zb.geometry)::json AS geometry,
        json_build_object(
          'id', z.id,
          'name', z.name,
          'code', z.code,
          'district', json_build_object(
            'id', d.id,
            'name', d.name,
            'code', d.code
          )
        ) AS zone
      ${zoneBlockFromSql}
      ${whereClause}
      ORDER BY zb.name ASC
    `;
  },

  getZoneBlockById: async (id) => fetchZoneBlockById(id),

  updateZoneBlock: async (id, { zoneId, name, code, status, geometry }) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Zone block ID is required");
    }

    const cleanId = id.trim();
    const existing = await prisma.zoneBlock.findUnique({
      where: { id: cleanId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Zone block not found");
    }

    if (zoneId) {
      await assertZoneExists(zoneId);
    }

    validateStatus(status);

    if (geometry !== undefined) {
      validatePolygonGeometry(geometry);
    }

    const updates = [];

    if (zoneId !== undefined) {
      updates.push(Prisma.sql`zone_id = ${zoneId}`);
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
      return fetchZoneBlockById(cleanId);
    }

    updates.push(Prisma.sql`updated_at = CURRENT_TIMESTAMP`);

    await prisma.$executeRaw`
      UPDATE zone_blocks
      SET ${Prisma.join(updates, ", ")}
      WHERE id = ${cleanId}
    `;

    return fetchZoneBlockById(cleanId);
  },

  deleteZoneBlock: async (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Zone block ID is required");
    }

    const cleanId = id.trim();
    const zoneBlock = await prisma.zoneBlock.findUnique({
      where: { id: cleanId },
      select: {
        id: true,
        _count: { select: { addresses: true } },
      },
    });

    if (!zoneBlock) {
      throw new Error("Zone block not found");
    }

    if (zoneBlock._count.addresses > 0) {
      throw new Error(
        "Cannot delete zone block with existing addresses. Remove them first."
      );
    }

    await prisma.zoneBlock.delete({ where: { id: cleanId } });

    return { id: cleanId };
  },
};
