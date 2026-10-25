/*
  Warnings:

  - You are about to drop the column `specimenId` on the `LabOrderItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AuditLogEntityType" AS ENUM ('SPECIMEN', 'LAB_ORDER_ITEM');

-- DropForeignKey
ALTER TABLE "public"."LabOrderItem" DROP CONSTRAINT "LabOrderItem_specimenId_fkey";

-- AlterTable
ALTER TABLE "LabOrderItem" DROP COLUMN "specimenId";

-- AlterTable
ALTER TABLE "Specimen" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;

-- CreateTable
CREATE TABLE "LabOrderItemSpecimen" (
    "specimenId" TEXT NOT NULL,
    "labOrderItemId" TEXT NOT NULL,
    "endReason" TEXT,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabOrderItemSpecimen_pkey" PRIMARY KEY ("labOrderItemId","specimenId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "laboratoryId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "AuditLogEntityType" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabOrderItemSpecimen_specimenId_idx" ON "LabOrderItemSpecimen"("specimenId");

-- CreateIndex
CREATE INDEX "LabOrderItemSpecimen_labOrderItemId_idx" ON "LabOrderItemSpecimen"("labOrderItemId");

-- CreateIndex
CREATE INDEX "AuditLog_laboratoryId_entityType_entityId_createdAt_idx" ON "AuditLog"("laboratoryId", "entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_laboratoryId_action_createdAt_idx" ON "AuditLog"("laboratoryId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_laboratoryId_actorId_createdAt_idx" ON "AuditLog"("laboratoryId", "actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "LabOrderItemSpecimen" ADD CONSTRAINT "LabOrderItemSpecimen_specimenId_fkey" FOREIGN KEY ("specimenId") REFERENCES "Specimen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderItemSpecimen" ADD CONSTRAINT "LabOrderItemSpecimen_labOrderItemId_fkey" FOREIGN KEY ("labOrderItemId") REFERENCES "LabOrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
