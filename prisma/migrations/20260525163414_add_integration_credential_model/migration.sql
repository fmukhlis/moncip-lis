/*
  Warnings:

  - The values [BASIC_AUTH,OAUTH2_CLIENT_CREDENTIALS,MTLS] on the enum `IntegrationAuthType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IntegrationAuthType_new" AS ENUM ('API_KEY', 'BEARER_TOKEN');
ALTER TABLE "IntegrationConnection" ALTER COLUMN "type" TYPE "IntegrationAuthType_new" USING ("type"::text::"IntegrationAuthType_new");
ALTER TYPE "IntegrationAuthType" RENAME TO "IntegrationAuthType_old";
ALTER TYPE "IntegrationAuthType_new" RENAME TO "IntegrationAuthType";
DROP TYPE "public"."IntegrationAuthType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "IntegrationEventType" ADD VALUE 'PATIENT_SYNC';

-- CreateTable
CREATE TABLE "IntegrationCredential" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "encryptedSecret" TEXT NOT NULL,
    "secretPrefix" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "revokedByUserId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntegrationCredential_laboratoryId_connectionId_idx" ON "IntegrationCredential"("laboratoryId", "connectionId");

-- CreateIndex
CREATE INDEX "IntegrationCredential_laboratoryId_secretPrefix_idx" ON "IntegrationCredential"("laboratoryId", "secretPrefix");

-- CreateIndex
CREATE INDEX "IntegrationCredential_laboratoryId_revokedAt_idx" ON "IntegrationCredential"("laboratoryId", "revokedAt");

-- AddForeignKey
ALTER TABLE "IntegrationCredential" ADD CONSTRAINT "IntegrationCredential_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationCredential" ADD CONSTRAINT "IntegrationCredential_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
