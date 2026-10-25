/*
  Warnings:

  - You are about to drop the column `payloadHash` on the `InboundIntegrationEvent` table. All the data in the column will be lost.
  - You are about to drop the column `rawPayload` on the `InboundIntegrationEvent` table. All the data in the column will be lost.
  - You are about to drop the column `payloadHash` on the `OutboundIntegrationEvent` table. All the data in the column will be lost.
  - You are about to drop the column `rawPayload` on the `OutboundIntegrationEvent` table. All the data in the column will be lost.
  - Added the required column `requestPayload` to the `InboundIntegrationEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestPayloadHash` to the `InboundIntegrationEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestPayload` to the `OutboundIntegrationEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestPayloadHash` to the `OutboundIntegrationEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InboundIntegrationEvent" DROP COLUMN "payloadHash",
DROP COLUMN "rawPayload",
ADD COLUMN     "requestPayload" JSONB NOT NULL,
ADD COLUMN     "requestPayloadHash" TEXT NOT NULL,
ADD COLUMN     "resultSummary" JSONB;

-- AlterTable
ALTER TABLE "OutboundIntegrationEvent" DROP COLUMN "payloadHash",
DROP COLUMN "rawPayload",
ADD COLUMN     "requestPayload" JSONB NOT NULL,
ADD COLUMN     "requestPayloadHash" TEXT NOT NULL,
ADD COLUMN     "resultSummary" JSONB;
