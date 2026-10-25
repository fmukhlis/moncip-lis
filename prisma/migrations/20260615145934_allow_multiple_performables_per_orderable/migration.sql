-- DropIndex
DROP INDEX "public"."LisPerformable_laboratoryId_externalOrderableId_key";

-- CreateIndex
CREATE INDEX "LisPerformable_laboratoryId_externalOrderableId_idx" ON "LisPerformable"("laboratoryId", "externalOrderableId");
