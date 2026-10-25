import prisma from "@/lib/prisma";
import { makeAuditLogInput } from "@/test/factories/audit-log.factory";
import { AUDIT_ACTIONS } from "../audit-log.constant";
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
  it("writes exactly the persisted fields to the client it is given", async () => {
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
  });

  it("connects the actor and the laboratory instead of creating them", async () => {
    const { db, create } = makeDatabase();
    const input = makeAuditLogInput();

    await createAuditLog(db, input);

    const { data } = firstCreateArgs(create);

    expect(data.actor).toEqual({ connect: { id: input.actorId } });
    expect(data.laboratory).toEqual({ connect: { id: input.laboratoryId } });
    expect(Object.keys(data.actor as object)).toEqual(["connect"]);
    expect(Object.keys(data.laboratory as object)).toEqual(["connect"]);
  });

  it("does not set server-managed fields", async () => {
    const { db, create } = makeDatabase();

    await createAuditLog(db, makeAuditLogInput());

    const { data } = firstCreateArgs(create);

    expect(data).not.toHaveProperty("id");
    expect(data).not.toHaveProperty("createdAt");
    expect(data).not.toHaveProperty("updatedAt");
  });

  it("leaves the optional fields unset when they are omitted", async () => {
    const { db, create } = makeDatabase();

    await createAuditLog(db, makeAuditLogInput());

    const { data } = firstCreateArgs(create);

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

  it("returns the record created by the client", async () => {
    const row = { id: "audit_log_id", action: AUDIT_ACTIONS.SPECIMEN_CREATED };
    const { db } = makeDatabase(row);

    await expect(createAuditLog(db, makeAuditLogInput())).resolves.toBe(row);
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

  it.each(Object.values(AUDIT_ACTIONS))(
    "persists the %s action verbatim",
    async (action) => {
      const { db, create } = makeDatabase();

      await createAuditLog(db, makeAuditLogInput({ action }));

      expect(firstCreateArgs(create).data.action).toBe(action);
    },
  );
});
