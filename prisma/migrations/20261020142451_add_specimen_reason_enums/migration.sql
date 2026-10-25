/*
  Warnings:

  - The `cancellationReason` column on the `Specimen` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rejectionReason` column on the `Specimen` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SpecimenRejectionReason" AS ENUM ('INSUFFICIENT_VOLUME', 'HEMOLYZED', 'CLOTTED', 'WRONG_CONTAINER', 'MISMATCHED_IDENTITY', 'CONTAMINATED', 'OTHER');

-- CreateEnum
CREATE TYPE "SpecimenCancellationReason" AS ENUM ('NO_LONGER_NEEDED', 'LAB_ORDER_CANCELLED', 'DUPLICATE_SPECIMEN', 'OTHER');

-- AlterTable
ALTER TABLE "Specimen" DROP COLUMN "cancellationReason",
ADD COLUMN     "cancellationReason" "SpecimenCancellationReason",
DROP COLUMN "rejectionReason",
ADD COLUMN     "rejectionReason" "SpecimenRejectionReason";
