/*
  Warnings:

  - A unique constraint covering the columns `[laboratoryId,sourceSystem,externalNo]` on the table `LabOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."LabOrder_laboratoryId_externalEncounterId_idx";

-- DropIndex
DROP INDEX "public"."LabOrder_laboratoryId_status_receivedAt_idx";

-- CreateIndex
CREATE INDEX "LabOrder_laboratoryId_status_priority_idx" ON "LabOrder"("laboratoryId", "status", "priority");

-- CreateIndex
CREATE INDEX "LabOrder_laboratoryId_createdAt_idx" ON "LabOrder"("laboratoryId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_laboratoryId_sourceSystem_externalNo_key" ON "LabOrder"("laboratoryId", "sourceSystem", "externalNo");
