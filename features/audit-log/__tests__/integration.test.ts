/**
 * @jest-environment node
 */

import { AuditLogEntityType } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import {
  AUDIT_LOG_TEST_IDS,
  makeAuditLogInput,
  type AuditLogInput,
} from "@/test/factories/audit-log.factory";
import { AUDIT_ACTIONS } from "../audit-log.constant";
import { CreateAuditLogSchema } from "../audit-log.schema";
import { createAuditLog } from "../audit-log.service";

const createdLaboratoryIds: string[] = [];
const createdUserIds: string[] = [];

async function createActorAndLaboratory() {
  const laboratory = await prisma.laboratory.create({ data: {} });
  createdLaboratoryIds.push(laboratory.id);

  const actor = await prisma.user.create({
    data: {
      name: "Audit Actor",
      role: "LAB_ADMIN",
      username: `actor_${laboratory.id}`,
      laboratoryId: laboratory.id,
    },
  });
  createdUserIds.push(actor.id);

  return { actor, laboratory };
}

function inputFor(
  actorId: string,
  laboratoryId: string,
  overrides: Partial<AuditLogInput> = {},
): AuditLogInput {
  return makeAuditLogInput({ actorId, laboratoryId, ...overrides });
}

afterEach(async () => {
  await prisma.auditLog.deleteMany({
    where: { laboratoryId: { in: createdLaboratoryIds } },
  });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.laboratory.deleteMany({
    where: { id: { in: createdLaboratoryIds } },
  });

  createdLaboratoryIds.length = 0;
  createdUserIds.length = 0;
});

describe("createAuditLog (database)", () => {
  it("persists every field and lets the database own the id and timestamp", async () => {
    const { actor, laboratory } = await createActorAndLaboratory();
    const input = inputFor(actor.id, laboratory.id, {
      action: AUDIT_ACTIONS.SPECIMEN_REJECTED,
      reason: "Haemolysed sample.",
      metadata: { previousStatus: "RECEIVED" },
    });

    const created = await createAuditLog(prisma, input);

    expect(created.id).toEqual(expect.any(String));
    expect(created.id.length).toBeGreaterThan(0);
    expect(created).toMatchObject({
      actorId: actor.id,
      action: AUDIT_ACTIONS.SPECIMEN_REJECTED,
      entityId: input.entityId,
      entityType: AuditLogEntityType.SPECIMEN,
      reason: "Haemolysed sample.",
      metadata: { previousStatus: "RECEIVED" },
      laboratoryId: laboratory.id,
    });
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(Math.abs(created.createdAt.getTime() - Date.now())).toBeLessThan(
      60_000,
    );

    const stored = await prisma.auditLog.findUniqueOrThrow({
      where: { id: created.id },
    });

    expect(stored).toMatchObject({
      action: AUDIT_ACTIONS.SPECIMEN_REJECTED,
      reason: "Haemolysed sample.",
      metadata: { previousStatus: "RECEIVED" },
    });
  });

  it("stores omitted optional fields as null", async () => {
    const { actor, laboratory } = await createActorAndLaboratory();

    const created = await createAuditLog(
      prisma,
      inputFor(actor.id, laboratory.id),
    );

    expect(created.reason).toBeNull();
    expect(created.metadata).toBeNull();
  });

  it("round-trips nested metadata through the JSON column", async () => {
    const { actor, laboratory } = await createActorAndLaboratory();
    const metadata = {
      previousStatus: "RECEIVED",
      counts: { orders: 2, ratio: 1.5 },
      flags: [true, false, null],
      note: "héllo 世界 🧪",
    };

    const created = await createAuditLog(
      prisma,
      inputFor(actor.id, laboratory.id, { metadata }),
    );

    expect(created.metadata).toEqual(metadata);

    const stored = await prisma.auditLog.findUniqueOrThrow({
      where: { id: created.id },
    });

    expect(stored.metadata).toEqual(metadata);
  });

  it("rejects an unknown actor and persists nothing", async () => {
    const { laboratory } = await createActorAndLaboratory();

    // Prisma reports a failed nested `connect` as P2025 (record not found).
    await expect(
      createAuditLog(
        prisma,
        inputFor(AUDIT_LOG_TEST_IDS.actorId, laboratory.id),
      ),
    ).rejects.toMatchObject({ code: "P2025" });

    await expect(
      prisma.auditLog.count({ where: { laboratoryId: laboratory.id } }),
    ).resolves.toBe(0);
  });

  it("rejects an unknown laboratory and persists nothing", async () => {
    const { actor } = await createActorAndLaboratory();

    // Prisma reports a failed nested `connect` as P2025 (record not found).
    await expect(
      createAuditLog(
        prisma,
        inputFor(actor.id, AUDIT_LOG_TEST_IDS.laboratoryId),
      ),
    ).rejects.toMatchObject({ code: "P2025" });

    await expect(
      prisma.auditLog.count({
        where: { laboratoryId: AUDIT_LOG_TEST_IDS.laboratoryId },
      }),
    ).resolves.toBe(0);
  });

  it("does not enforce entityId referentially", async () => {
    const { actor, laboratory } = await createActorAndLaboratory();

    const created = await createAuditLog(
      prisma,
      inputFor(actor.id, laboratory.id, {
        entityId: AUDIT_LOG_TEST_IDS.otherEntityId,
      }),
    );

    expect(created.entityId).toBe(AUDIT_LOG_TEST_IDS.otherEntityId);
  });

  it("accepts any action string at the database level, so the schema is the only guard", async () => {
    const { laboratory } = await createActorAndLaboratory();

    const created = await prisma.auditLog.create({
      data: {
        action: "NOT_A_REAL_ACTION",
        entityId: AUDIT_LOG_TEST_IDS.entityId,
        entityType: AuditLogEntityType.SPECIMEN,
        laboratoryId: laboratory.id,
      },
    });

    expect(created.action).toBe("NOT_A_REAL_ACTION");
    expect(
      CreateAuditLogSchema.safeParse({
        ...inputFor(AUDIT_LOG_TEST_IDS.actorId, laboratory.id),
        action: "NOT_A_REAL_ACTION",
      }).success,
    ).toBe(false);
  });

  it("scopes entries by laboratory, entity type and entity id", async () => {
    const laboratoryA = await createActorAndLaboratory();
    const laboratoryB = await createActorAndLaboratory();
    const entityX = AUDIT_LOG_TEST_IDS.entityId;
    const entityY = AUDIT_LOG_TEST_IDS.otherEntityId;

    const targeted = await createAuditLog(
      prisma,
      inputFor(laboratoryA.actor.id, laboratoryA.laboratory.id, {
        entityId: entityX,
      }),
    );
    await createAuditLog(
      prisma,
      inputFor(laboratoryA.actor.id, laboratoryA.laboratory.id, {
        entityId: entityY,
      }),
    );
    await createAuditLog(
      prisma,
      inputFor(laboratoryB.actor.id, laboratoryB.laboratory.id, {
        entityId: entityX,
      }),
    );

    const history = await prisma.auditLog.findMany({
      where: {
        entityId: entityX,
        entityType: AuditLogEntityType.SPECIMEN,
        laboratoryId: laboratoryA.laboratory.id,
      },
    });

    expect(history.map(({ id }) => id)).toEqual([targeted.id]);
    await expect(
      prisma.auditLog.count({
        where: { entityId: entityX, laboratoryId: laboratoryB.laboratory.id },
      }),
    ).resolves.toBe(1);
  });

  it("rolls the entry back when the surrounding transaction fails", async () => {
    const { actor, laboratory } = await createActorAndLaboratory();

    await expect(
      prisma.$transaction(async (tx) => {
        await createAuditLog(tx, inputFor(actor.id, laboratory.id));

        throw new Error("domain write failed");
      }),
    ).rejects.toThrow("domain write failed");

    await expect(
      prisma.auditLog.count({ where: { laboratoryId: laboratory.id } }),
    ).resolves.toBe(0);
  });

  it("commits the entry together with the surrounding transaction", async () => {
    const { actor, laboratory } = await createActorAndLaboratory();

    const created = await prisma.$transaction((tx) =>
      createAuditLog(tx, inputFor(actor.id, laboratory.id)),
    );

    await expect(
      prisma.auditLog.findUnique({ where: { id: created.id } }),
    ).resolves.not.toBeNull();
  });

  it("ignores server-managed fields supplied by the caller", async () => {
    const { actor, laboratory } = await createActorAndLaboratory();
    const forged = {
      ...inputFor(actor.id, laboratory.id),
      id: "forged_id",
      createdAt: new Date("2000-01-01T00:00:00.000Z"),
    } as unknown as AuditLogInput;

    const created = await createAuditLog(prisma, forged);

    expect(created.id).not.toBe("forged_id");
    expect(created.createdAt.getTime()).toBeGreaterThan(
      new Date("2020-01-01T00:00:00.000Z").getTime(),
    );
  });

  // TODO: align the schema and the column, then delete this test.
  it("keeps the schema stricter than the database (known gap: actorId is nullable in Postgres)", async () => {
    const { laboratory } = await createActorAndLaboratory();
    const withoutActor = {
      action: AUDIT_ACTIONS.SPECIMEN_CREATED,
      entityId: AUDIT_LOG_TEST_IDS.entityId,
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId: laboratory.id,
    };

    const created = await prisma.auditLog.create({ data: withoutActor });

    expect(created.actorId).toBeNull();
    expect(CreateAuditLogSchema.safeParse(withoutActor).success).toBe(false);
  });
});
