-- The direct relation between a lab order and its specimens is removed: an order
-- reaches its specimens through its items (`LabOrderItemSpecimen`), which is the
-- only place the assignment is kept from now on.
--
-- The column can only be dropped once every specimen is reachable through that
-- join. Specimens created before the join existed (see
-- 20261019084508_change_specimen_relation_and_add_audit_log, which dropped
-- `LabOrderItem.specimenId` together with the item a specimen belonged to) are
-- backfilled below when the data determines their items unambiguously. Anything
-- that stays ambiguous aborts the migration with a diagnostic, so no historical
-- specimen or association is ever discarded silently.

BEGIN;

-- 1. Backfill the item assignments of the specimens that have none.
--
-- A live (not cancelled) item of the specimen's own order is a candidate when
-- its specimen type snapshot agrees with the specimen — an item without a
-- snapshot cannot disagree — and when no other active specimen already claims
-- it. An item claimed by several unmatched specimens is ambiguous, so those
-- pairs are left out and the guard below reports them instead of guessing.
--
-- The assignment keeps the history of the specimen: a cancelled or rejected
-- specimen ends its assignments at the moment it ended, while a specimen that
-- still stands keeps them active, exactly as the application writes them.
WITH orphan_specimen AS (
  SELECT
    s.id,
    s."labOrderId",
    s."laboratoryId",
    s.status,
    s."createdAt",
    s."cancelledAt",
    s."rejectedAt",
    st.code AS "specimenTypeCode",
    st."displayName" AS "specimenTypeDisplayName"
  FROM "Specimen" s
  JOIN "SpecimenType" st ON st.id = s."specimenTypeId"
  WHERE NOT EXISTS (
    SELECT 1
    FROM "LabOrderItemSpecimen" existing
    WHERE existing."specimenId" = s.id
  )
),
candidate_assignment AS (
  SELECT
    o.*,
    i.id AS "labOrderItemId"
  FROM orphan_specimen o
  JOIN "LabOrderItem" i ON i."labOrderId" = o."labOrderId"
  WHERE i.status <> 'CANCELLED'
    AND (
      i."specimenTypeCodeSnapshot" IS NULL
      OR i."specimenTypeCodeSnapshot" = o."specimenTypeCode"
      OR i."specimenTypeDisplaySnapshot" = o."specimenTypeDisplayName"
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "LabOrderItemSpecimen" active
      WHERE active."labOrderItemId" = i.id
        AND active."endedAt" IS NULL
    )
),
unambiguous_assignment AS (
  SELECT c.*
  FROM candidate_assignment c
  WHERE NOT EXISTS (
    SELECT 1
    FROM candidate_assignment other
    WHERE other."labOrderItemId" = c."labOrderItemId"
      AND other.id <> c.id
  )
)
INSERT INTO "LabOrderItemSpecimen" (
  "id",
  "laboratoryId",
  "specimenId",
  "labOrderItemId",
  "endReason",
  "endedAt",
  "assignedAt",
  "createdAt"
)
SELECT
  -- A cuid-shaped id, the same shape the Prisma client generates for this table.
  'c' || substr(
    md5(
      random()::text || clock_timestamp()::text || a.id || a."labOrderItemId"
    ),
    1,
    23
  ),
  a."laboratoryId",
  a.id,
  a."labOrderItemId",
  (
    CASE
      WHEN a.status = 'CANCELLED' THEN 'SPECIMEN_CANCELLED'
      WHEN a.status = 'REJECTED' THEN 'SPECIMEN_REJECTED'
    END
  )::"SpecimenAssignmentEndReason",
  CASE
    WHEN a.status = 'CANCELLED' THEN COALESCE(a."cancelledAt", a."createdAt")
    WHEN a.status = 'REJECTED' THEN COALESCE(a."rejectedAt", a."createdAt")
  END,
  a."createdAt",
  a."createdAt"
FROM unambiguous_assignment a
ON CONFLICT ("id") DO NOTHING;

-- 2. Refuse to drop the relation while a specimen would become unreachable.
DO $$
DECLARE
  unmapped_specimen text;
BEGIN
  SELECT string_agg(
    format('%s (status %s, lab order %s)', s.id, s.status::text, s."labOrderId"),
    ', '
  )
  INTO unmapped_specimen
  FROM "Specimen" s
  WHERE NOT EXISTS (
    SELECT 1
    FROM "LabOrderItemSpecimen" existing
    WHERE existing."specimenId" = s.id
  );

  IF unmapped_specimen IS NOT NULL THEN
    RAISE EXCEPTION
      'Cannot drop "Specimen.labOrderId": no lab order item could be derived for specimen(s) %',
      unmapped_specimen;
  END IF;
END $$;

-- 3. Drop the direct relation.
ALTER TABLE "Specimen" DROP CONSTRAINT "Specimen_labOrderId_fkey";
DROP INDEX "Specimen_laboratoryId_labOrderId_idx";
ALTER TABLE "Specimen" DROP COLUMN "labOrderId";

COMMIT;
