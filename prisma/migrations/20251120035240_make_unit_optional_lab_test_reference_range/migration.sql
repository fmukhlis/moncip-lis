-- DropForeignKey
ALTER TABLE "public"."LabTest" DROP CONSTRAINT "LabTest_defaultUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReferenceRange" DROP CONSTRAINT "ReferenceRange_unitId_fkey";

-- AlterTable
ALTER TABLE "LabTest" ALTER COLUMN "defaultUnitId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ReferenceRange" ALTER COLUMN "unitId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceRange" ADD CONSTRAINT "ReferenceRange_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
