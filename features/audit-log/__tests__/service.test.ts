import prisma from "@/lib/prisma";
import { makeAuditLogInput } from "@/test/factories/audit-log.factory";
import { createAuditLog } from "../audit-log.service";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { auditLog: { create: jest.fn() } },
}));

const globalCreate = (prisma as unknown as { auditLog: { create: jest.Mock } })
  .auditLog.create;

type CreateArgs = { data: Record<string, unknown> };

function makeDatabase(result: unknown = { id: "audit_log_id" }) {
  const create = jest.fn().mockResolvedValue(result);
  const db = { auditLog: { create } } as unknown as Pick<
    typeof prisma,
    "auditLog"
  >;

  return { db, create };
}

function firstCreateArgs(create: jest.Mock): CreateArgs {
  expect(create).toHaveBeenCalledTimes(1);

  return create.mock.calls[0][0] as CreateArgs;
}

describe("createAuditLog", () => {
  it("writes exactly the persisted fields, letting the database own the rest", async () => {
    const { db, create } = makeDatabase();
    const input = makeAuditLogInput();

    await createAuditLog(db, input);

    const { data } = firstCreateArgs(create);

    expect(data).toEqual({
      actor: { connect: { id: input.actorId } },
      action: input.action,
      reason: input.reason,
      entityId: input.entityId,
      metadata: input.metadata,
      entityType: input.entityType,
      laboratory: { connect: { id: input.laboratoryId } },
    });
    // This key list is what keeps `id`, `createdAt` and `updatedAt` out of the
    // write, and keeps the actor/laboratory as connections rather than creates.
    expect(Object.keys(data).sort()).toEqual(
      [
        "action",
        "actor",
        "entityId",
        "entityType",
        "laboratory",
        "metadata",
        "reason",
      ].sort(),
    );
    // Omitted optional fields stay absent instead of being written as null.
    expect(data.reason).toBeUndefined();
    expect(data.metadata).toBeUndefined();
  });

  it("passes metadata through without serialising or mutating it", async () => {
    const { db, create } = makeDatabase();
    const metadata = {
      previousStatus: "RECEIVED",
      endedLabOrderItemSpecimenIds: ["order_item_specimen_1"],
    };

    await createAuditLog(db, makeAuditLogInput({ metadata }));

    const { data } = firstCreateArgs(create);

    expect(data.metadata).toBe(metadata);
    expect(metadata).toEqual({
      previousStatus: "RECEIVED",
      endedLabOrderItemSpecimenIds: ["order_item_specimen_1"],
    });
  });

  it("uses the supplied client rather than the global Prisma client", async () => {
    const { db, create } = makeDatabase();

    await createAuditLog(db, makeAuditLogInput());

    expect(create).toHaveBeenCalledTimes(1);
    expect(globalCreate).not.toHaveBeenCalled();
  });

  it("propagates persistence failures so the caller's transaction can roll back", async () => {
    const error = new Error("connection reset by peer");
    const { db, create } = makeDatabase();
    create.mockRejectedValueOnce(error);

    await expect(createAuditLog(db, makeAuditLogInput())).rejects.toBe(error);
  });
});
