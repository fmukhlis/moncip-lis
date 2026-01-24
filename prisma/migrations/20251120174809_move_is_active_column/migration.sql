/*
  Warnings:

  - You are about to drop the column `isActive` on the `LabTest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LabTest" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "LaboratoriesOnLabTests" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
