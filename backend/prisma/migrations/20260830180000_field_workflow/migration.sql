-- AlterEnum
ALTER TYPE "AssignmentType" ADD VALUE 'REGISTER_ADDRESSES';

-- AlterTable
ALTER TABLE "neighborhoods" ADD COLUMN "geometry" geometry(Geometry, 4326);

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN "zone_id" TEXT;

-- CreateIndex
CREATE INDEX "assignment_zone_index" ON "assignments"("zone_id");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
