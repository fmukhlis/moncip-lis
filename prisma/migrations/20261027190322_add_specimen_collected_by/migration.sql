-- AlterTable
ALTER TABLE "Specimen" ADD COLUMN     "collectedById" TEXT;

-- CreateIndex
CREATE INDEX "Specimen_laboratoryId_collectedById_idx" ON "Specimen"("laboratoryId", "collectedById");

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
