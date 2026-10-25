"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { CreateAuditLogSchema } from "./audit-log.schema";

type DatabaseClient = typeof prisma;

export async function createAuditLog(
  db: Pick<DatabaseClient, "auditLog">,
  {
    action,
    reason,
    actorId,
    entityId,
    metadata,
    entityType,
    laboratoryId,
  }: z.infer<typeof CreateAuditLogSchema>,
) {
  return db.auditLog.create({
    data: {
      actor: { connect: { id: actorId } },
      action,
      reason,
      entityId,
      metadata,
      entityType,
      laboratory: { connect: { id: laboratoryId } },
    },
  });
}
