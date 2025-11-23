/*
  Warnings:

  - You are about to drop the column `defaultUnitId` on the `LabTest` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `LabTestGroup` table. All the data in the column will be lost.
  - You are about to drop the `_CategoryToLabTestGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LabTestGroupToLaboratory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LabTestToLabTestGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LabTestToLaboratory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `laboratoryId` to the `LabTestGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `labTestGroupId` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."LabTest" DROP CONSTRAINT "LabTest_defaultUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_labTestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReferenceRange" DROP CONSTRAINT "ReferenceRange_labTestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CategoryToLabTestGroup" DROP CONSTRAINT "_CategoryToLabTestGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CategoryToLabTestGroup" DROP CONSTRAINT "_CategoryToLabTestGroup_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestGroupToLaboratory" DROP CONSTRAINT "_LabTestGroupToLaboratory_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestGroupToLaboratory" DROP CONSTRAINT "_LabTestGroupToLaboratory_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestToLabTestGroup" DROP CONSTRAINT "_LabTestToLabTestGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestToLabTestGroup" DROP CONSTRAINT "_LabTestToLabTestGroup_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestToLaboratory" DROP CONSTRAINT "_LabTestToLaboratory_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestToLaboratory" DROP CONSTRAINT "_LabTestToLaboratory_B_fkey";

-- AlterTable
ALTER TABLE "LabTest" DROP COLUMN "defaultUnitId";

-- AlterTable
ALTER TABLE "LabTestGroup" DROP COLUMN "categoryId",
ADD COLUMN     "laboratoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "labTestGroupId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_CategoryToLabTestGroup";

-- DropTable
DROP TABLE "public"."_LabTestGroupToLaboratory";

-- DropTable
DROP TABLE "public"."_LabTestToLabTestGroup";

-- DropTable
DROP TABLE "public"."_LabTestToLaboratory";

-- CreateTable
CREATE TABLE "LaboratoriesOnLabTests" (
    "id" TEXT NOT NULL,
    "labTestId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "defaultUnitId" TEXT,

    CONSTRAINT "LaboratoriesOnLabTests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LaboratoriesOnLabTests" ADD CONSTRAINT "LaboratoriesOnLabTests_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoriesOnLabTests" ADD CONSTRAINT "LaboratoriesOnLabTests_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoriesOnLabTests" ADD CONSTRAINT "LaboratoriesOnLabTests_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestGroup" ADD CONSTRAINT "LabTestGroup_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceRange" ADD CONSTRAINT "ReferenceRange_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LaboratoriesOnLabTests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LaboratoriesOnLabTests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_labTestGroupId_fkey" FOREIGN KEY ("labTestGroupId") REFERENCES "LabTestGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
