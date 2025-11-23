/*
  Warnings:

  - You are about to drop the column `labTestId` on the `Price` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[labTestId,laboratoryId]` on the table `LaboratoriesOnLabTests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `laboratoriesOnLabTestsId` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_labTestId_fkey";

-- AlterTable
ALTER TABLE "Price" DROP COLUMN "labTestId",
ADD COLUMN     "laboratoriesOnLabTestsId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LaboratoriesOnLabTests_labTestId_laboratoryId_key" ON "LaboratoriesOnLabTests"("labTestId", "laboratoryId");

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_laboratoriesOnLabTestsId_fkey" FOREIGN KEY ("laboratoriesOnLabTestsId") REFERENCES "LaboratoriesOnLabTests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
