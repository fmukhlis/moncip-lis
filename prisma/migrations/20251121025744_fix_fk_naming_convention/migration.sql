/*
  Warnings:

  - You are about to drop the column `labTestId` on the `ReferenceRange` table. All the data in the column will be lost.
  - Added the required column `laboratoriesOnLabTestsId` to the `ReferenceRange` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ReferenceRange" DROP CONSTRAINT "ReferenceRange_labTestId_fkey";

-- AlterTable
ALTER TABLE "ReferenceRange" DROP COLUMN "labTestId",
ADD COLUMN     "laboratoriesOnLabTestsId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ReferenceRange" ADD CONSTRAINT "ReferenceRange_laboratoriesOnLabTestsId_fkey" FOREIGN KEY ("laboratoriesOnLabTestsId") REFERENCES "LaboratoriesOnLabTests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
