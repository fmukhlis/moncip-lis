/*
  Warnings:

  - The `endReason` column on the `LabOrderItemSpecimen` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SpecimenAssignmentEndReason" AS ENUM ('REASSIGNED', 'SPECIMEN_REJECTED', 'SPECIMEN_CANCELLED', 'LAB_ORDER_ITEM_CANCELLED');

-- AlterTable
ALTER TABLE "LabOrderItemSpecimen" DROP COLUMN "endReason",
ADD COLUMN     "endReason" "SpecimenAssignmentEndReason";
