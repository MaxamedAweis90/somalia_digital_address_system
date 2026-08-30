ALTER TABLE "assignments" ADD COLUMN "expected_collector_count" INTEGER;

UPDATE "assignments"
SET "expected_collector_count" = 1
WHERE "tier" = 'PARENT' AND "expected_collector_count" IS NULL;
