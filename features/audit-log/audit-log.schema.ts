import { z } from "zod";
import { AUDIT_ACTIONS } from "./audit-log.constant";
import { AuditLogEntityType } from "@/generated/prisma";
import { jsonObjectSchema, requiredCuid2 } from "@/lib/custom-zod-types";

export const CreateAuditLogSchema = z.object({
  action: z.enum(AUDIT_ACTIONS),
  reason: z.string().trim().min(1).optional(),
  actorId: requiredCuid2("User"),
  entityId: requiredCuid2("Entity"),
  metadata: jsonObjectSchema.optional(),
  entityType: z.enum(AuditLogEntityType),
  laboratoryId: requiredCuid2("Laboratory"),
});
