/*
  Warnings:

  - You are about to drop the column `externalProviderId` on the `LabOrder` table. All the data in the column will be lost.
  - Added the required column `externalOrderingProviderId` to the `LabOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LabOrder" DROP COLUMN "externalProviderId",
ADD COLUMN     "externalOrderingProviderId" TEXT NOT NULL;
