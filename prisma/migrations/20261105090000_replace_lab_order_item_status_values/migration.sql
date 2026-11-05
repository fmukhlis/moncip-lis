-- Replace the lab order item status enum.
--
-- Postgres cannot remove enum labels, so the column is rewritten through a new
-- type with an explicit mapping instead of a plain `::text::` cast, which would
-- fail on every row holding a removed label:
--
--   OPEN, PRINTED       -> ORDERED    (intake; work has not started)
--   COLLECTED, RECEIVED -> IN_PROCESS (the specimen lifecycle is tracked by Specimen)
--   PRELIMINARY, VERIFIED, REJECTED, TNP, CANCELLED stay as they are.
BEGIN;
CREATE TYPE "LabOrderItemStatus_new" AS ENUM ('ORDERED', 'IN_PROCESS', 'PRELIMINARY', 'VERIFIED', 'REJECTED', 'TNP', 'CANCELLED');
ALTER TABLE "public"."LabOrderItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LabOrderItem" ALTER COLUMN "status" TYPE "LabOrderItemStatus_new" USING (
  CASE "status"::text
    WHEN 'OPEN' THEN 'ORDERED'
    WHEN 'PRINTED' THEN 'ORDERED'
    WHEN 'COLLECTED' THEN 'IN_PROCESS'
    WHEN 'RECEIVED' THEN 'IN_PROCESS'
    ELSE "status"::text
  END
)::"LabOrderItemStatus_new";
ALTER TYPE "LabOrderItemStatus" RENAME TO "LabOrderItemStatus_old";
ALTER TYPE "LabOrderItemStatus_new" RENAME TO "LabOrderItemStatus";
DROP TYPE "public"."LabOrderItemStatus_old";
ALTER TABLE "LabOrderItem" ALTER COLUMN "status" SET DEFAULT 'ORDERED';
COMMIT;
