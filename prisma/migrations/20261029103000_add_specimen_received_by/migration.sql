-- AlterTable
ALTER TABLE "Specimen" ADD COLUMN "receivedById" TEXT;

-- CreateIndex
CREATE INDEX "Specimen_laboratoryId_receivedById_idx" ON "Specimen"("laboratoryId", "receivedById");

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
