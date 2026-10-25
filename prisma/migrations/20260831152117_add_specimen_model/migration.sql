-- CreateEnum
CREATE TYPE "SpecimenStatus" AS ENUM ('PENDING', 'COLLECTED', 'RECEIVED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "LabOrderItem" ADD COLUMN     "specimenId" TEXT;

-- CreateTable
CREATE TABLE "Specimen" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "specimenTypeId" TEXT NOT NULL,
    "note" TEXT,
    "status" "SpecimenStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "collectedAt" TIMESTAMP(3),

    CONSTRAINT "Specimen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Specimen_laboratoryId_status_idx" ON "Specimen"("laboratoryId", "status");

-- CreateIndex
CREATE INDEX "Specimen_laboratoryId_patientId_idx" ON "Specimen"("laboratoryId", "patientId");

-- CreateIndex
CREATE INDEX "Specimen_laboratoryId_labOrderId_idx" ON "Specimen"("laboratoryId", "labOrderId");

-- CreateIndex
CREATE INDEX "Specimen_laboratoryId_specimenTypeId_idx" ON "Specimen"("laboratoryId", "specimenTypeId");

-- AddForeignKey
ALTER TABLE "LabOrderItem" ADD CONSTRAINT "LabOrderItem_specimenId_fkey" FOREIGN KEY ("specimenId") REFERENCES "Specimen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_specimenTypeId_fkey" FOREIGN KEY ("specimenTypeId") REFERENCES "SpecimenType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
