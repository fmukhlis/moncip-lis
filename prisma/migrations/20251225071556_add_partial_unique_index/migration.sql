/*
  Warnings:

  - A unique constraint on the table `Price` and `LabTestGroup` will be added. If there are existing duplicate values, this will fail.

*/

-- Manually create partial unique index
CREATE UNIQUE INDEX "LabTestGroup_code_laboratoryId_active" ON "LabTestGroup"("code", "laboratoryId") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Price_labTestGroupId_tariffGroupId_active" ON "Price"("labTestGroupId", "tariffGroupId") WHERE "validTo" IS NULL;
CREATE UNIQUE INDEX "Price_laboratoriesOnLabTestsId_tariffGroupId_active" ON "Price"("laboratoriesOnLabTestsId", "tariffGroupId") WHERE "validTo" IS NULL;