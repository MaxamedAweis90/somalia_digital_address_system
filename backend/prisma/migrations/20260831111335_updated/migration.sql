/*
  Warnings:

  - Added the required column `region_id` to the `districts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_parent_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_zone_id_fkey";

-- AlterTable
ALTER TABLE "districts" ADD COLUMN     "region_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "zone_blocks" RENAME CONSTRAINT "zones_pkey" TO "zone_blocks_pkey";

-- AlterTable
ALTER TABLE "zones" RENAME CONSTRAINT "neighborhoods_pkey" TO "zones_pkey";

-- CreateTable
CREATE TABLE "login_otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "type" "SettingType" NOT NULL DEFAULT 'STRING',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_otp_user_consumed_index" ON "login_otps"("user_id", "consumed");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE INDEX "region_code_index" ON "regions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "app_settings"("key");

-- CreateIndex
CREATE INDEX "app_setting_category_index" ON "app_settings"("category");

-- CreateIndex
CREATE INDEX "district_region_index" ON "districts"("region_id");

-- RenameForeignKey
ALTER TABLE "addresses" RENAME CONSTRAINT "addresses_zone_id_fkey" TO "addresses_zone_block_id_fkey";

-- RenameForeignKey
ALTER TABLE "addresses" RENAME CONSTRAINT "addresses_neighborhood_id_fkey" TO "addresses_zone_id_fkey";

-- RenameForeignKey
ALTER TABLE "assignments" RENAME CONSTRAINT "assignments_neighborhood_id_fkey" TO "assignments_zone_id_fkey";

-- RenameForeignKey
ALTER TABLE "zone_blocks" RENAME CONSTRAINT "zones_neighborhood_id_fkey" TO "zone_blocks_zone_id_fkey";

-- RenameForeignKey
ALTER TABLE "zones" RENAME CONSTRAINT "neighborhoods_district_id_fkey" TO "zones_district_id_fkey";

-- AddForeignKey
ALTER TABLE "login_otps" ADD CONSTRAINT "login_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_zone_block_id_fkey" FOREIGN KEY ("zone_block_id") REFERENCES "zone_blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_parent_assignment_id_fkey" FOREIGN KEY ("parent_assignment_id") REFERENCES "assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "zones_code_key" RENAME TO "zone_blocks_code_key";

-- RenameIndex
ALTER INDEX "neighborhoods_code_key" RENAME TO "zones_code_key";
