-- DropIndex
DROP INDEX "public"."LabTestGroup_code_key";

-- Manually create partial unique index
CREATE UNIQUE INDEX "LabTestGroup_active_code_key" ON "LabTestGroup"("code") WHERE "deletedAt" IS NULL