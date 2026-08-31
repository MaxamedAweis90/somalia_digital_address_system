-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DATA_COLLECTOR';

-- AlterEnum
ALTER TYPE "AssignmentStatus" ADD VALUE 'READY_FOR_REVIEW';

-- CreateEnum
CREATE TYPE "AssignmentTier" AS ENUM ('PARENT', 'CHILD');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "supervisor_id" TEXT;

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN "parent_assignment_id" TEXT,
ADD COLUMN "tier" "AssignmentTier" NOT NULL DEFAULT 'PARENT',
ADD COLUMN "scope" JSONB,
ADD COLUMN "merge_order" INTEGER,
ADD COLUMN "officer_reviewed_at" TIMESTAMP(3),
ADD COLUMN "officer_reviewed_by_id" TEXT;

-- CreateIndex
CREATE INDEX "user_supervisor_index" ON "user"("supervisor_id");

-- CreateIndex
CREATE INDEX "assignment_parent_index" ON "assignments"("parent_assignment_id");

-- CreateIndex
CREATE INDEX "assignment_tier_status_index" ON "assignments"("tier", "status");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_parent_assignment_id_fkey" FOREIGN KEY ("parent_assignment_id") REFERENCES "assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_officer_reviewed_by_id_fkey" FOREIGN KEY ("officer_reviewed_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
