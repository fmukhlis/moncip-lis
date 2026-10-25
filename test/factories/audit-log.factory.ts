import { z } from "zod";
import { AuditLogEntityType } from "@/generated/prisma";
import { AUDIT_ACTIONS } from "@/features/audit-log/audit-log.constant";
import { CreateAuditLogSchema } from "@/features/audit-log/audit-log.schema";

export type AuditLogInput = z.infer<typeof CreateAuditLogSchema>;

/**
 * Stable, valid cuid2 values.
 *
 * Zod's `cuid2()` only asserts `/^[0-9a-z]+$/`, so these do not need to be
 * real generated ids, only lowercase alphanumeric strings.
 */
export const AUDIT_LOG_TEST_IDS = {
  actorId: "tz4a98xxat96iws9zmbrgj3a",
  entityId: "ckqp6y6q50000qzrm8b1v3f7d",
  otherEntityId: "c9wq3x1v70000qzrm5t2h8k4d",
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
} as const;

/**
 * Builds a complete, valid `CreateAuditLogSchema` payload.
 *
 * Tests only override the fields they care about, so every case documents
 * exactly one decision.
 */
export function makeAuditLogInput(
  overrides: Partial<AuditLogInput> = {},
): AuditLogInput {
  return {
    action: AUDIT_ACTIONS.SPECIMEN_CREATED,
    actorId: AUDIT_LOG_TEST_IDS.actorId,
    entityId: AUDIT_LOG_TEST_IDS.entityId,
    entityType: AuditLogEntityType.SPECIMEN,
    laboratoryId: AUDIT_LOG_TEST_IDS.laboratoryId,
    ...overrides,
  };
}
