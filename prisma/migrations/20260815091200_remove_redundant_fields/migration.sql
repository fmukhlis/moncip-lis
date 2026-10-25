/*
  Warnings:

  - You are about to drop the column `clinicalContextSnapshot` on the `LabOrder` table. All the data in the column will be lost.
  - You are about to drop the column `encounterSnapshot` on the `LabOrder` table. All the data in the column will be lost.
  - You are about to drop the column `orderingProviderSnapshot` on the `LabOrder` table. All the data in the column will be lost.
  - You are about to drop the column `patientSnapshot` on the `LabOrder` table. All the data in the column will be lost.
  - You are about to drop the column `rawOrderSnapshot` on the `LabOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LabOrder" DROP COLUMN "clinicalContextSnapshot",
DROP COLUMN "encounterSnapshot",
DROP COLUMN "orderingProviderSnapshot",
DROP COLUMN "patientSnapshot",
DROP COLUMN "rawOrderSnapshot";
