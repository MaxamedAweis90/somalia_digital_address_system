-- Rename old zones (cadastral blocks) to zone_blocks before neighborhoods becomes zones
ALTER TABLE "zones" RENAME TO "zone_blocks";

-- Rename address FK columns (zone_id becomes zone_block_id first to avoid name clash)
ALTER TABLE "addresses" RENAME COLUMN "zone_id" TO "zone_block_id";
ALTER TABLE "addresses" RENAME COLUMN "neighborhood_id" TO "zone_id";

-- Rename assignment FK columns
ALTER TABLE "assignments" RENAME COLUMN "zone_id" TO "zone_block_id";
ALTER TABLE "assignments" RENAME COLUMN "neighborhood_id" TO "zone_id";

-- Rename neighborhoods table to zones
ALTER TABLE "neighborhoods" RENAME TO "zones";

-- Rename zone_blocks parent FK column
ALTER TABLE "zone_blocks" RENAME COLUMN "neighborhood_id" TO "zone_id";

-- Rename indexes (zone index first to avoid name clash)
ALTER INDEX IF EXISTS "assignment_zone_index" RENAME TO "assignment_zone_block_index";
ALTER INDEX IF EXISTS "assignment_neighborhood_index" RENAME TO "assignment_zone_index";

ALTER INDEX IF EXISTS "neighborhood_code_and_district_index" RENAME TO "zone_code_and_district_index";
ALTER INDEX IF EXISTS "zone_code_and_neighborhood_index" RENAME TO "zone_block_code_and_zone_index";
ALTER TYPE "AssignmentType" RENAME VALUE 'DEFINE_ZONES' TO 'DEFINE_ZONE_BLOCKS';

-- Update assignment payload keys from zones to zoneBlocks
UPDATE "assignments"
SET payload = jsonb_set(payload - 'zones', '{zoneBlocks}', COALESCE(payload->'zones', '[]'::jsonb))
WHERE payload ? 'zones';

-- Update default payload for new rows
ALTER TABLE "assignments" ALTER COLUMN "payload" SET DEFAULT '{"zoneBlocks":[]}';
