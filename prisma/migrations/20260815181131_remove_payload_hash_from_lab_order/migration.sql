/*
  Warnings:

  - You are about to drop the column `payloadHash` on the `LabOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LabOrder" DROP COLUMN "payloadHash";
