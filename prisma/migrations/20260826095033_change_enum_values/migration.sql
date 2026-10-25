/*
  Warnings:

  - The values [ORDERED] on the enum `LabOrderItemStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_SPECIMEN] on the enum `LabOrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LabOrderItemStatus_new" AS ENUM ('OPEN', 'PRINTED', 'COLLECTED', 'RECEIVED', 'PRELIMINARY', 'VERIFIED', 'REJECTED', 'TNP', 'CANCELLED');
ALTER TABLE "public"."LabOrderItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LabOrderItem" ALTER COLUMN "status" TYPE "LabOrderItemStatus_new" USING ("status"::text::"LabOrderItemStatus_new");
ALTER TYPE "LabOrderItemStatus" RENAME TO "LabOrderItemStatus_old";
ALTER TYPE "LabOrderItemStatus_new" RENAME TO "LabOrderItemStatus";
DROP TYPE "public"."LabOrderItemStatus_old";
ALTER TABLE "LabOrderItem" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "LabOrderStatus_new" AS ENUM ('ORDERED', 'IN_PROCESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."LabOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LabOrder" ALTER COLUMN "status" TYPE "LabOrderStatus_new" USING ("status"::text::"LabOrderStatus_new");
ALTER TYPE "LabOrderStatus" RENAME TO "LabOrderStatus_old";
ALTER TYPE "LabOrderStatus_new" RENAME TO "LabOrderStatus";
DROP TYPE "public"."LabOrderStatus_old";
ALTER TABLE "LabOrder" ALTER COLUMN "status" SET DEFAULT 'ORDERED';
COMMIT;

-- AlterTable
ALTER TABLE "LabOrder" ALTER COLUMN "status" SET DEFAULT 'ORDERED';

-- AlterTable
ALTER TABLE "LabOrderItem" ALTER COLUMN "status" SET DEFAULT 'OPEN';
