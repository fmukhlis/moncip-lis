/*
  Warnings:

  - You are about to drop the column `isOrderable` on the `LabTestGroup` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `LaboratoriesOnLabTests` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `LabTestGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LaboratoriesOnLabTests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Laboratory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ReferenceRange` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LabTestGroup" DROP COLUMN "isOrderable",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "notOrderableReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validTo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LaboratoriesOnLabTests" DROP COLUMN "isActive",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "notOrderableReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Laboratory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ReferenceRange" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
