-- AlterTable
ALTER TABLE "assignments"
DROP COLUMN IF EXISTS "parent_id",
ADD COLUMN IF NOT EXISTS "expected_collector_count" INTEGER;

-- Backfill existing parent assignments to 1
UPDATE "assignments"
SET "expected_collector_count" = 1
WHERE "parent_assignment_id" IS NULL;
