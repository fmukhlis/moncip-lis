/*
  Warnings:

  - Added the required column `type` to the `IntegrationConnection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IntegrationAuthType" AS ENUM ('API_KEY', 'BEARER_TOKEN', 'BASIC_AUTH', 'OAUTH2_CLIENT_CREDENTIALS', 'MTLS');

-- AlterTable
ALTER TABLE "IntegrationConnection" ADD COLUMN     "baseUrl" TEXT,
ADD COLUMN     "type" "IntegrationAuthType" NOT NULL;
