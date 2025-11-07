/*
  Warnings:

  - You are about to drop the column `unitId` on the `LabTest` table. All the data in the column will be lost.
  - Added the required column `defaultUnitId` to the `LabTest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LabTest" DROP CONSTRAINT "LabTest_unitId_fkey";

-- AlterTable
ALTER TABLE "LabTest" DROP COLUMN "unitId",
ADD COLUMN     "defaultUnitId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_units" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_units_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_units_B_index" ON "_units"("B");

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_units" ADD CONSTRAINT "_units_A_fkey" FOREIGN KEY ("A") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_units" ADD CONSTRAINT "_units_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
