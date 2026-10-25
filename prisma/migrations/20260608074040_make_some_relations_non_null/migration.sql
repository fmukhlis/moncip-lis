/*
  Warnings:

  - Made the column `tokenId` on table `InboundIntegrationEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `connectionId` on table `InboundIntegrationEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `connectionId` on table `OutboundIntegrationEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `credentialId` on table `OutboundIntegrationEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."InboundIntegrationEvent" DROP CONSTRAINT "InboundIntegrationEvent_connectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InboundIntegrationEvent" DROP CONSTRAINT "InboundIntegrationEvent_tokenId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OutboundIntegrationEvent" DROP CONSTRAINT "OutboundIntegrationEvent_connectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OutboundIntegrationEvent" DROP CONSTRAINT "OutboundIntegrationEvent_credentialId_fkey";

-- AlterTable
ALTER TABLE "InboundIntegrationEvent" ALTER COLUMN "tokenId" SET NOT NULL,
ALTER COLUMN "connectionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "OutboundIntegrationEvent" ALTER COLUMN "connectionId" SET NOT NULL,
ALTER COLUMN "credentialId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "InboundIntegrationEvent" ADD CONSTRAINT "InboundIntegrationEvent_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "IntegrationToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundIntegrationEvent" ADD CONSTRAINT "InboundIntegrationEvent_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundIntegrationEvent" ADD CONSTRAINT "OutboundIntegrationEvent_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundIntegrationEvent" ADD CONSTRAINT "OutboundIntegrationEvent_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "IntegrationCredential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
