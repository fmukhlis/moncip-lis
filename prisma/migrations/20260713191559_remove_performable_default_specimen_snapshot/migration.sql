/*
  Warnings:

  - You are about to drop the column `defaultSpecimenTypeCode` on the `LisPerformable` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSpecimenTypeDisplay` on the `LisPerformable` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LisPerformable" DROP COLUMN "defaultSpecimenTypeCode",
DROP COLUMN "defaultSpecimenTypeDisplay";
