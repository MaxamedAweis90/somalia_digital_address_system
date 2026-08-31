-- AlterEnum
ALTER TYPE "AssignmentType" ADD VALUE 'DEFINE_ZONE_BLOCKS';
ALTER TYPE "AssignmentType" ADD VALUE 'REGISTER_ADDRESSES';

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN "expected_collector_count" INTEGER,
ADD COLUMN "parent_id" TEXT;

-- CreateIndex
CREATE INDEX "assignment_parent_index" ON "assignments"("parent_id");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing parent assignments to 1
UPDATE "assignments" SET "expected_collector_count" = 1 WHERE "parent_id" IS NULL;
