/*
  Warnings:

  - Added the required column `laboratoryId` to the `LabOrderItemSpecimen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LabOrderItemSpecimen" ADD COLUMN     "laboratoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "LabOrderItemSpecimen" ADD CONSTRAINT "LabOrderItemSpecimen_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
