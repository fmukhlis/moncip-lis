/*
  Warnings:

  - You are about to drop the column `externalOrderNumber` on the `LabOrder` table. All the data in the column will be lost.
  - You are about to drop the column `lisOrderNumber` on the `LabOrder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[laboratoryId,no]` on the table `LabOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `no` to the `LabOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `LabOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence` to the `LabOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."LabOrder_laboratoryId_lisOrderNumber_key";

-- AlterTable
ALTER TABLE "LabOrder" DROP COLUMN "externalOrderNumber",
DROP COLUMN "lisOrderNumber",
ADD COLUMN     "externalNo" TEXT,
ADD COLUMN     "no" TEXT NOT NULL,
ADD COLUMN     "period" TEXT NOT NULL,
ADD COLUMN     "sequence" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "LabOrderCounter" (
    "period" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabOrderCounter_pkey" PRIMARY KEY ("period")
);

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_laboratoryId_no_key" ON "LabOrder"("laboratoryId", "no");
