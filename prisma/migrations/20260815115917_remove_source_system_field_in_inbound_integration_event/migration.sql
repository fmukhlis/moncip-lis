/*
  Warnings:

  - You are about to drop the column `sourceSystem` on the `InboundIntegrationEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[laboratoryId,connectionId,idempotencyKey]` on the table `InboundIntegrationEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[laboratoryId,connectionId,messageId]` on the table `InboundIntegrationEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."InboundIntegrationEvent_laboratoryId_sourceSystem_externalO_idx";

-- DropIndex
DROP INDEX "public"."InboundIntegrationEvent_laboratoryId_sourceSystem_idempoten_key";

-- DropIndex
DROP INDEX "public"."InboundIntegrationEvent_laboratoryId_sourceSystem_messageId_key";

-- AlterTable
ALTER TABLE "InboundIntegrationEvent" DROP COLUMN "sourceSystem";

-- CreateIndex
CREATE INDEX "InboundIntegrationEvent_laboratoryId_connectionId_externalO_idx" ON "InboundIntegrationEvent"("laboratoryId", "connectionId", "externalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "InboundIntegrationEvent_laboratoryId_connectionId_idempoten_key" ON "InboundIntegrationEvent"("laboratoryId", "connectionId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "InboundIntegrationEvent_laboratoryId_connectionId_messageId_key" ON "InboundIntegrationEvent"("laboratoryId", "connectionId", "messageId");
