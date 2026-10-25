/*
  Warnings:

  - The primary key for the `LabOrderItemSpecimen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `LabOrderItemSpecimen` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "LabOrderItemSpecimen" DROP CONSTRAINT "LabOrderItemSpecimen_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "LabOrderItemSpecimen_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "LabOrderItemSpecimen_labOrderItemId_specimenId_idx" ON "LabOrderItemSpecimen"("labOrderItemId", "specimenId");
