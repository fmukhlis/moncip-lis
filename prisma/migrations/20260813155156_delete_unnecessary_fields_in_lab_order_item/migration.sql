/*
  Warnings:

  - You are about to drop the column `externalOrderableSnapshot` on the `LabOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `requestedCode` on the `LabOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `requestedCodeSystem` on the `LabOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `requestedDisplay` on the `LabOrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LabOrderItem" DROP COLUMN "externalOrderableSnapshot",
DROP COLUMN "requestedCode",
DROP COLUMN "requestedCodeSystem",
DROP COLUMN "requestedDisplay";
