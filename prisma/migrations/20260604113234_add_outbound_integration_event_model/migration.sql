-- CreateEnum
CREATE TYPE "OutboundIntegrationEventStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'ACKNOWLEDGED', 'FAILED', 'RETRY_WAITING', 'CANCELLED');

-- CreateTable
CREATE TABLE "OutboundIntegrationEvent" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT,
    "connectionId" TEXT,
    "credentialId" TEXT,
    "laboratoryId" TEXT NOT NULL,
    "status" "OutboundIntegrationEventStatus" NOT NULL DEFAULT 'QUEUED',
    "errorCode" TEXT,
    "eventType" "IntegrationEventType" NOT NULL,
    "messageId" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "targetSystem" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "externalOrderId" TEXT,
    "responsePayload" JSONB,
    "sentAt" TIMESTAMP(3),
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nextRetryAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "OutboundIntegrationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutboundIntegrationEvent_laboratoryId_targetSystem_external_idx" ON "OutboundIntegrationEvent"("laboratoryId", "targetSystem", "externalOrderId");

-- CreateIndex
CREATE INDEX "OutboundIntegrationEvent_laboratoryId_status_queuedAt_idx" ON "OutboundIntegrationEvent"("laboratoryId", "status", "queuedAt");

-- CreateIndex
CREATE INDEX "OutboundIntegrationEvent_laboratoryId_labOrderId_idx" ON "OutboundIntegrationEvent"("laboratoryId", "labOrderId");

-- CreateIndex
CREATE INDEX "OutboundIntegrationEvent_laboratoryId_credentialId_idx" ON "OutboundIntegrationEvent"("laboratoryId", "credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "OutboundIntegrationEvent_laboratoryId_targetSystem_idempote_key" ON "OutboundIntegrationEvent"("laboratoryId", "targetSystem", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "OutboundIntegrationEvent_laboratoryId_targetSystem_messageI_key" ON "OutboundIntegrationEvent"("laboratoryId", "targetSystem", "messageId");

-- AddForeignKey
ALTER TABLE "OutboundIntegrationEvent" ADD CONSTRAINT "OutboundIntegrationEvent_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundIntegrationEvent" ADD CONSTRAINT "OutboundIntegrationEvent_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundIntegrationEvent" ADD CONSTRAINT "OutboundIntegrationEvent_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "IntegrationCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundIntegrationEvent" ADD CONSTRAINT "OutboundIntegrationEvent_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
