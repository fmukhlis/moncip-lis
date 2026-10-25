/*
  Warnings:

  - Made the column `connectionId` on table `ExternalLabOrderable` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ExternalLabOrderable" DROP CONSTRAINT "ExternalLabOrderable_connectionId_fkey";

-- AlterTable
ALTER TABLE "ExternalLabOrderable" ALTER COLUMN "connectionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ExternalLabOrderable" ADD CONSTRAINT "ExternalLabOrderable_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
