/*
  Warnings:

  - You are about to drop the `_LabTestToLabTestGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_LabTestToLabTestGroup" DROP CONSTRAINT "_LabTestToLabTestGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestToLabTestGroup" DROP CONSTRAINT "_LabTestToLabTestGroup_B_fkey";

-- DropTable
DROP TABLE "public"."_LabTestToLabTestGroup";

-- CreateTable
CREATE TABLE "_LabTestGroupToLaboratoriesOnLabTests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabTestGroupToLaboratoriesOnLabTests_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LabTestGroupToLaboratoriesOnLabTests_B_index" ON "_LabTestGroupToLaboratoriesOnLabTests"("B");

-- AddForeignKey
ALTER TABLE "_LabTestGroupToLaboratoriesOnLabTests" ADD CONSTRAINT "_LabTestGroupToLaboratoriesOnLabTests_A_fkey" FOREIGN KEY ("A") REFERENCES "LabTestGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestGroupToLaboratoriesOnLabTests" ADD CONSTRAINT "_LabTestGroupToLaboratoriesOnLabTests_B_fkey" FOREIGN KEY ("B") REFERENCES "LaboratoriesOnLabTests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
