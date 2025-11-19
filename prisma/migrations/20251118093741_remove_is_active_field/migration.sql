/*
  Warnings:

  - You are about to drop the column `isActive` on the `LabTestGroup` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Price` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LabTestGroup" DROP COLUMN "isActive",
ADD COLUMN     "isOrderable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Price" DROP COLUMN "isActive";
