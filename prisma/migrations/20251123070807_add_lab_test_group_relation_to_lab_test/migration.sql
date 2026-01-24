-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_labTestGroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_laboratoriesOnLabTestsId_fkey";

-- AlterTable
ALTER TABLE "Price" ALTER COLUMN "labTestGroupId" DROP NOT NULL,
ALTER COLUMN "laboratoriesOnLabTestsId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_LabTestToLabTestGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabTestToLabTestGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LabTestToLabTestGroup_B_index" ON "_LabTestToLabTestGroup"("B");

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_labTestGroupId_fkey" FOREIGN KEY ("labTestGroupId") REFERENCES "LabTestGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_laboratoriesOnLabTestsId_fkey" FOREIGN KEY ("laboratoriesOnLabTestsId") REFERENCES "LaboratoriesOnLabTests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestToLabTestGroup" ADD CONSTRAINT "_LabTestToLabTestGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestToLabTestGroup" ADD CONSTRAINT "_LabTestToLabTestGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "LabTestGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
