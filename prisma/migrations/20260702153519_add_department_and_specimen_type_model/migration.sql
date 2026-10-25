/*
  Warnings:

  - You are about to drop the column `departmentCode` on the `LisPerformable` table. All the data in the column will be lost.
  - You are about to drop the column `departmentDisplay` on the `LisPerformable` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."LisPerformable_laboratoryId_departmentCode_idx";

-- AlterTable
ALTER TABLE "LisPerformable" DROP COLUMN "departmentCode",
DROP COLUMN "departmentDisplay",
ADD COLUMN     "departmentId" TEXT;

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LisPerformableSpecimenType" (
    "specimenTypeId" TEXT NOT NULL,
    "lisPerformableId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LisPerformableSpecimenType_pkey" PRIMARY KEY ("lisPerformableId","specimenTypeId")
);

-- CreateTable
CREATE TABLE "SpecimenType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecimenType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Department_laboratoryId_idx" ON "Department"("laboratoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_laboratoryId_code_key" ON "Department"("laboratoryId", "code");

-- CreateIndex
CREATE INDEX "LisPerformableSpecimenType_specimenTypeId_idx" ON "LisPerformableSpecimenType"("specimenTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecimenType_code_key" ON "SpecimenType"("code");

-- CreateIndex
CREATE INDEX "LisPerformable_laboratoryId_departmentId_idx" ON "LisPerformable"("laboratoryId", "departmentId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LisPerformable" ADD CONSTRAINT "LisPerformable_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LisPerformableSpecimenType" ADD CONSTRAINT "LisPerformableSpecimenType_specimenTypeId_fkey" FOREIGN KEY ("specimenTypeId") REFERENCES "SpecimenType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LisPerformableSpecimenType" ADD CONSTRAINT "LisPerformableSpecimenType_lisPerformableId_fkey" FOREIGN KEY ("lisPerformableId") REFERENCES "LisPerformable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
