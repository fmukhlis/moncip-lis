/*
  Warnings:

  - You are about to drop the column `externalOrderId` on the `LabOrder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[laboratoryId,sourceSystem,externalId]` on the table `LabOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `LabOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."LabOrder_laboratoryId_sourceSystem_externalOrderId_key";

-- AlterTable
ALTER TABLE "LabOrder" DROP COLUMN "externalOrderId",
ADD COLUMN     "externalId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_laboratoryId_sourceSystem_externalId_key" ON "LabOrder"("laboratoryId", "sourceSystem", "externalId");
