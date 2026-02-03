/*
  Warnings:

  - A unique constraint on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/

-- Manually create partial unique index
CREATE UNIQUE INDEX "Patient_externalSystemId_laboratoryId_active" ON "Patient"("externalSystemId", "laboratoryId") WHERE "deletedAt" IS NULL