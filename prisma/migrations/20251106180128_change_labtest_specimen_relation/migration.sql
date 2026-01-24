/*
  Warnings:

  - You are about to drop the column `specimenId` on the `LabTest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LabTest" DROP CONSTRAINT "LabTest_specimenId_fkey";

-- AlterTable
ALTER TABLE "LabTest" DROP COLUMN "specimenId";

-- CreateTable
CREATE TABLE "_LabTestToSpecimen" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabTestToSpecimen_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LabTestToSpecimen_B_index" ON "_LabTestToSpecimen"("B");

-- AddForeignKey
ALTER TABLE "_LabTestToSpecimen" ADD CONSTRAINT "_LabTestToSpecimen_A_fkey" FOREIGN KEY ("A") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestToSpecimen" ADD CONSTRAINT "_LabTestToSpecimen_B_fkey" FOREIGN KEY ("B") REFERENCES "Specimen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
