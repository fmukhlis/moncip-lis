/*
  Warnings:

  - You are about to drop the column `externalSystemId` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InboundOrderEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LabTest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LabTestGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LaboratoriesOnLabTests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Method` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReferenceRange` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Scale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Specimen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TariffGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestOrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Unit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitConversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LabTestGroupToLaboratoriesOnLabTests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LabTestToSpecimen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_units` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[laboratoryId,sourceSystem,externalPatientId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceSystem` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PatientSex" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "IntegrationEventType" AS ENUM ('CLINICAL_ORDER_CREATED', 'CATALOG_SYNC');

-- CreateEnum
CREATE TYPE "InboundIntegrationEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "ExternalOrderableType" AS ENUM ('TEST', 'PANEL');

-- CreateEnum
CREATE TYPE "LisPerformableType" AS ENUM ('SINGLE', 'PANEL');

-- CreateEnum
CREATE TYPE "ResultValueType" AS ENUM ('NUMERIC', 'TEXT', 'CODED', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('PENDING_SPECIMEN', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabOrderItemStatus" AS ENUM ('ORDERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabOrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- DropForeignKey
ALTER TABLE "public"."InboundOrderEvent" DROP CONSTRAINT "InboundOrderEvent_testOrderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabTest" DROP CONSTRAINT "LabTest_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabTest" DROP CONSTRAINT "LabTest_methodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabTest" DROP CONSTRAINT "LabTest_scaleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabTestGroup" DROP CONSTRAINT "LabTestGroup_laboratoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LaboratoriesOnLabTests" DROP CONSTRAINT "LaboratoriesOnLabTests_defaultUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LaboratoriesOnLabTests" DROP CONSTRAINT "LaboratoriesOnLabTests_labTestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LaboratoriesOnLabTests" DROP CONSTRAINT "LaboratoriesOnLabTests_laboratoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_labTestGroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_laboratoriesOnLabTestsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_tariffGroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReferenceRange" DROP CONSTRAINT "ReferenceRange_laboratoriesOnLabTestsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReferenceRange" DROP CONSTRAINT "ReferenceRange_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestOrder" DROP CONSTRAINT "TestOrder_canceledById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestOrder" DROP CONSTRAINT "TestOrder_orderedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestOrder" DROP CONSTRAINT "TestOrder_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestOrder" DROP CONSTRAINT "TestOrder_tariffGroupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestOrder" DROP CONSTRAINT "TestOrder_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestOrderItem" DROP CONSTRAINT "TestOrderItem_canceledById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestOrderItem" DROP CONSTRAINT "TestOrderItem_laboratoriesOnLabTestsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestOrderItem" DROP CONSTRAINT "TestOrderItem_testOrderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UnitConversion" DROP CONSTRAINT "UnitConversion_fromUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UnitConversion" DROP CONSTRAINT "UnitConversion_toUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestGroupToLaboratoriesOnLabTests" DROP CONSTRAINT "_LabTestGroupToLaboratoriesOnLabTests_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestGroupToLaboratoriesOnLabTests" DROP CONSTRAINT "_LabTestGroupToLaboratoriesOnLabTests_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestToSpecimen" DROP CONSTRAINT "_LabTestToSpecimen_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_LabTestToSpecimen" DROP CONSTRAINT "_LabTestToSpecimen_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_units" DROP CONSTRAINT "_units_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_units" DROP CONSTRAINT "_units_B_fkey";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "externalSystemId",
DROP COLUMN "gender",
DROP COLUMN "source",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "externalPatientId" TEXT,
ADD COLUMN     "lastSnapshot" JSONB,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "mrn" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "sex" "PatientSex" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "sourceSystem" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."Category";

-- DropTable
DROP TABLE "public"."InboundOrderEvent";

-- DropTable
DROP TABLE "public"."LabTest";

-- DropTable
DROP TABLE "public"."LabTestGroup";

-- DropTable
DROP TABLE "public"."LaboratoriesOnLabTests";

-- DropTable
DROP TABLE "public"."Method";

-- DropTable
DROP TABLE "public"."Price";

-- DropTable
DROP TABLE "public"."ReferenceRange";

-- DropTable
DROP TABLE "public"."Scale";

-- DropTable
DROP TABLE "public"."Specimen";

-- DropTable
DROP TABLE "public"."TariffGroup";

-- DropTable
DROP TABLE "public"."TestOrder";

-- DropTable
DROP TABLE "public"."TestOrderItem";

-- DropTable
DROP TABLE "public"."Unit";

-- DropTable
DROP TABLE "public"."UnitConversion";

-- DropTable
DROP TABLE "public"."_LabTestGroupToLaboratoriesOnLabTests";

-- DropTable
DROP TABLE "public"."_LabTestToSpecimen";

-- DropTable
DROP TABLE "public"."_units";

-- DropEnum
DROP TYPE "public"."AgeUnit";

-- DropEnum
DROP TYPE "public"."EventStatus";

-- DropEnum
DROP TYPE "public"."Gender";

-- DropEnum
DROP TYPE "public"."OrderEventType";

-- DropEnum
DROP TYPE "public"."OrderItemStatus";

-- DropEnum
DROP TYPE "public"."OrderPriority";

-- DropEnum
DROP TYPE "public"."OrderSource";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- DropEnum
DROP TYPE "public"."Source";

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sourceSystem" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationToken" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "revokedByUserId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalLabOrderable" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT,
    "laboratoryId" TEXT NOT NULL,
    "type" "ExternalOrderableType" NOT NULL DEFAULT 'TEST',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryCode" TEXT,
    "externalCode" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "categoryDisplay" TEXT,
    "externalDisplay" TEXT NOT NULL,
    "externalCodeSystem" TEXT NOT NULL,
    "rawCatalogSnapshot" JSONB,
    "externalOrderableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "ExternalLabOrderable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LisPerformable" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "externalOrderableId" TEXT NOT NULL,
    "type" "LisPerformableType" NOT NULL DEFAULT 'SINGLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,
    "departmentCode" TEXT,
    "departmentDisplay" TEXT,
    "defaultSpecimenTypeCode" TEXT,
    "defaultSpecimenTypeDisplay" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LisPerformable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LisResultComponent" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "performableId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "unitCode" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "valueType" "ResultValueType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,
    "unitDisplay" TEXT,
    "decimalPlaces" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LisResultComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "laboratoryId" TEXT NOT NULL,
    "status" "LabOrderStatus" NOT NULL DEFAULT 'PENDING_SPECIMEN',
    "priority" "LabOrderPriority" NOT NULL DEFAULT 'ROUTINE',
    "payloadHash" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "lisOrderNumber" TEXT NOT NULL,
    "externalOrderId" TEXT NOT NULL,
    "patientSnapshot" JSONB NOT NULL,
    "rawOrderSnapshot" JSONB NOT NULL,
    "encounterSnapshot" JSONB NOT NULL,
    "externalPatientId" TEXT NOT NULL,
    "externalProviderId" TEXT NOT NULL,
    "externalEncounterId" TEXT NOT NULL,
    "externalOrderNumber" TEXT,
    "clinicalContextSnapshot" JSONB,
    "orderingProviderSnapshot" JSONB NOT NULL,
    "orderedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrderItem" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "performableId" TEXT NOT NULL,
    "externalOrderableId" TEXT NOT NULL,
    "note" TEXT,
    "status" "LabOrderItemStatus" NOT NULL DEFAULT 'ORDERED',
    "priority" "LabOrderPriority",
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "requestedCode" TEXT NOT NULL,
    "requestedDisplay" TEXT NOT NULL,
    "performableSnapshot" JSONB,
    "externalOrderItemId" TEXT NOT NULL,
    "requestedCodeSystem" TEXT NOT NULL,
    "specimenTypeCodeSnapshot" TEXT,
    "externalOrderableSnapshot" JSONB,
    "specimenTypeDisplaySnapshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundIntegrationEvent" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT,
    "labOrderId" TEXT,
    "connectionId" TEXT,
    "laboratoryId" TEXT NOT NULL,
    "status" "InboundIntegrationEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorCode" TEXT,
    "eventType" "IntegrationEventType" NOT NULL,
    "messageId" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sourceSystem" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "externalOrderId" TEXT,
    "responsePayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "InboundIntegrationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntegrationConnection_laboratoryId_sourceSystem_idx" ON "IntegrationConnection"("laboratoryId", "sourceSystem");

-- CreateIndex
CREATE INDEX "IntegrationConnection_laboratoryId_isActive_idx" ON "IntegrationConnection"("laboratoryId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_laboratoryId_sourceSystem_name_key" ON "IntegrationConnection"("laboratoryId", "sourceSystem", "name");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationToken_tokenHash_key" ON "IntegrationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "IntegrationToken_laboratoryId_connectionId_idx" ON "IntegrationToken"("laboratoryId", "connectionId");

-- CreateIndex
CREATE INDEX "IntegrationToken_laboratoryId_tokenPrefix_idx" ON "IntegrationToken"("laboratoryId", "tokenPrefix");

-- CreateIndex
CREATE INDEX "IntegrationToken_laboratoryId_revokedAt_idx" ON "IntegrationToken"("laboratoryId", "revokedAt");

-- CreateIndex
CREATE INDEX "ExternalLabOrderable_laboratoryId_sourceSystem_idx" ON "ExternalLabOrderable"("laboratoryId", "sourceSystem");

-- CreateIndex
CREATE INDEX "ExternalLabOrderable_laboratoryId_isActive_idx" ON "ExternalLabOrderable"("laboratoryId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalLabOrderable_laboratoryId_sourceSystem_externalCode_key" ON "ExternalLabOrderable"("laboratoryId", "sourceSystem", "externalCodeSystem", "externalCode");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalLabOrderable_laboratoryId_sourceSystem_externalOrde_key" ON "ExternalLabOrderable"("laboratoryId", "sourceSystem", "externalOrderableId");

-- CreateIndex
CREATE INDEX "LisPerformable_laboratoryId_departmentCode_idx" ON "LisPerformable"("laboratoryId", "departmentCode");

-- CreateIndex
CREATE INDEX "LisPerformable_laboratoryId_isActive_idx" ON "LisPerformable"("laboratoryId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LisPerformable_laboratoryId_externalOrderableId_key" ON "LisPerformable"("laboratoryId", "externalOrderableId");

-- CreateIndex
CREATE INDEX "LisResultComponent_laboratoryId_performableId_idx" ON "LisResultComponent"("laboratoryId", "performableId");

-- CreateIndex
CREATE INDEX "LisResultComponent_laboratoryId_isActive_idx" ON "LisResultComponent"("laboratoryId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LisResultComponent_laboratoryId_performableId_code_key" ON "LisResultComponent"("laboratoryId", "performableId", "code");

-- CreateIndex
CREATE INDEX "LabOrder_laboratoryId_externalEncounterId_idx" ON "LabOrder"("laboratoryId", "externalEncounterId");

-- CreateIndex
CREATE INDEX "LabOrder_laboratoryId_status_receivedAt_idx" ON "LabOrder"("laboratoryId", "status", "receivedAt");

-- CreateIndex
CREATE INDEX "LabOrder_laboratoryId_externalPatientId_idx" ON "LabOrder"("laboratoryId", "externalPatientId");

-- CreateIndex
CREATE INDEX "LabOrder_laboratoryId_patientId_idx" ON "LabOrder"("laboratoryId", "patientId");

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_laboratoryId_sourceSystem_externalOrderId_key" ON "LabOrder"("laboratoryId", "sourceSystem", "externalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_laboratoryId_lisOrderNumber_key" ON "LabOrder"("laboratoryId", "lisOrderNumber");

-- CreateIndex
CREATE INDEX "LabOrderItem_laboratoryId_externalOrderableId_idx" ON "LabOrderItem"("laboratoryId", "externalOrderableId");

-- CreateIndex
CREATE INDEX "LabOrderItem_laboratoryId_performableId_idx" ON "LabOrderItem"("laboratoryId", "performableId");

-- CreateIndex
CREATE INDEX "LabOrderItem_laboratoryId_labOrderId_idx" ON "LabOrderItem"("laboratoryId", "labOrderId");

-- CreateIndex
CREATE INDEX "LabOrderItem_laboratoryId_status_idx" ON "LabOrderItem"("laboratoryId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LabOrderItem_labOrderId_externalOrderItemId_key" ON "LabOrderItem"("labOrderId", "externalOrderItemId");

-- CreateIndex
CREATE INDEX "InboundIntegrationEvent_laboratoryId_sourceSystem_externalO_idx" ON "InboundIntegrationEvent"("laboratoryId", "sourceSystem", "externalOrderId");

-- CreateIndex
CREATE INDEX "InboundIntegrationEvent_laboratoryId_status_receivedAt_idx" ON "InboundIntegrationEvent"("laboratoryId", "status", "receivedAt");

-- CreateIndex
CREATE INDEX "InboundIntegrationEvent_laboratoryId_labOrderId_idx" ON "InboundIntegrationEvent"("laboratoryId", "labOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "InboundIntegrationEvent_laboratoryId_sourceSystem_idempoten_key" ON "InboundIntegrationEvent"("laboratoryId", "sourceSystem", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "InboundIntegrationEvent_laboratoryId_sourceSystem_messageId_key" ON "InboundIntegrationEvent"("laboratoryId", "sourceSystem", "messageId");

-- CreateIndex
CREATE INDEX "Patient_laboratoryId_sourceSystem_idx" ON "Patient"("laboratoryId", "sourceSystem");

-- CreateIndex
CREATE INDEX "Patient_laboratoryId_name_idx" ON "Patient"("laboratoryId", "name");

-- CreateIndex
CREATE INDEX "Patient_laboratoryId_mrn_idx" ON "Patient"("laboratoryId", "mrn");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_laboratoryId_sourceSystem_externalPatientId_key" ON "Patient"("laboratoryId", "sourceSystem", "externalPatientId");

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationToken" ADD CONSTRAINT "IntegrationToken_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationToken" ADD CONSTRAINT "IntegrationToken_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalLabOrderable" ADD CONSTRAINT "ExternalLabOrderable_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalLabOrderable" ADD CONSTRAINT "ExternalLabOrderable_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LisPerformable" ADD CONSTRAINT "LisPerformable_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LisPerformable" ADD CONSTRAINT "LisPerformable_externalOrderableId_fkey" FOREIGN KEY ("externalOrderableId") REFERENCES "ExternalLabOrderable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LisResultComponent" ADD CONSTRAINT "LisResultComponent_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LisResultComponent" ADD CONSTRAINT "LisResultComponent_performableId_fkey" FOREIGN KEY ("performableId") REFERENCES "LisPerformable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderItem" ADD CONSTRAINT "LabOrderItem_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderItem" ADD CONSTRAINT "LabOrderItem_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderItem" ADD CONSTRAINT "LabOrderItem_performableId_fkey" FOREIGN KEY ("performableId") REFERENCES "LisPerformable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderItem" ADD CONSTRAINT "LabOrderItem_externalOrderableId_fkey" FOREIGN KEY ("externalOrderableId") REFERENCES "ExternalLabOrderable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundIntegrationEvent" ADD CONSTRAINT "InboundIntegrationEvent_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "IntegrationToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundIntegrationEvent" ADD CONSTRAINT "InboundIntegrationEvent_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundIntegrationEvent" ADD CONSTRAINT "InboundIntegrationEvent_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundIntegrationEvent" ADD CONSTRAINT "InboundIntegrationEvent_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
