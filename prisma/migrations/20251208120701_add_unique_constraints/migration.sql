/*
  Warnings:

  - A unique constraint covering the columns `[labTestGroupId,tariffGroupId]` on the table `Price` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[laboratoriesOnLabTestsId,tariffGroupId]` on the table `Price` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Price_labTestGroupId_tariffGroupId_key" ON "Price"("labTestGroupId", "tariffGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_laboratoriesOnLabTestsId_tariffGroupId_key" ON "Price"("laboratoriesOnLabTestsId", "tariffGroupId");
