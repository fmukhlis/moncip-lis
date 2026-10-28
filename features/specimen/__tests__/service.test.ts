import prisma from "@/lib/prisma";
import { SpecimenStatus } from "@/generated/prisma";
import { specimenDetailSelect } from "../specimen.select";
import { collectSpecimen } from "../specimen.service";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {},
}));

const TEST_IDS = {
  id: "tz4a98xxat96iws9zmbrgj3a",
  labOrderId: "ckqp6y6q50000qzrm8b1v3f7d",
  collectedById: "clx1a2b3c4d5e6f7g8h9i0jk",
  laboratoryId: "c9wq3x1v70000qzrm5t2h8k4d",
} as const;

const collectedAt = new Date("2026-10-27T09:30:00.000Z");

function makeParams(
  overrides: Partial<Parameters<typeof collectSpecimen>[1]> = {},
): Parameters<typeof collectSpecimen>[1] {
  return {
    id: TEST_IDS.id,
    labOrderId: TEST_IDS.labOrderId,
    laboratoryId: TEST_IDS.laboratoryId,
    collectedById: TEST_IDS.collectedById,
    collectedAt,
    status: SpecimenStatus.COLLECTED,
    ...overrides,
  };
}

type UpdateArgs = {
  where: Record<string, unknown>;
  data: Record<string, unknown>;
  select: unknown;
};

function makeDatabase(result: unknown = { id: TEST_IDS.id }) {
  const update = jest.fn().mockResolvedValue(result);
  const db = {
    specimen: { update },
  } as unknown as Pick<typeof prisma, "specimen">;

  return { db, update };
}

function firstUpdateArgs(update: jest.Mock): UpdateArgs {
  expect(update).toHaveBeenCalledTimes(1);

  return update.mock.calls[0][0] as UpdateArgs;
}

describe("collectSpecimen", () => {
  it("updates the specimen scoped to its laboratory", async () => {
    const { db, update } = makeDatabase();

    await collectSpecimen(db, makeParams({ note: "lipemic" }));

    const { where, data, select } = firstUpdateArgs(update);

    expect(where).toEqual({
      id: TEST_IDS.id,
      laboratoryId: TEST_IDS.laboratoryId,
    });
    expect(data).toEqual({
      status: SpecimenStatus.COLLECTED,
      collectedAt,
      collectedById: TEST_IDS.collectedById,
      note: "lipemic",
    });
    expect(select).toBe(specimenDetailSelect);
  });

  it("leaves the note untouched when it is omitted", async () => {
    const { db, update } = makeDatabase();

    await collectSpecimen(db, makeParams());

    const { data } = firstUpdateArgs(update);

    expect(data).toHaveProperty("note");
    expect(data.note).toBeUndefined();
    expect(Object.keys(data).sort()).toEqual(
      ["collectedAt", "collectedById", "note", "status"].sort(),
    );
  });

  it("clears the note when an empty string is supplied", async () => {
    const { db, update } = makeDatabase();

    await collectSpecimen(db, makeParams({ note: "" }));

    expect(firstUpdateArgs(update).data.note).toBeNull();
  });

  it("writes the status resolved by the caller", async () => {
    const { db, update } = makeDatabase();

    await collectSpecimen(db, makeParams({ status: SpecimenStatus.RECEIVED }));

    expect(firstUpdateArgs(update).data.status).toBe(SpecimenStatus.RECEIVED);
  });

  it("never touches the order item, received or cancellation fields", async () => {
    const { db, update } = makeDatabase();

    await collectSpecimen(db, makeParams());

    const { data } = firstUpdateArgs(update);

    expect(data).not.toHaveProperty("receivedAt");
    expect(data).not.toHaveProperty("rejectedAt");
    expect(data).not.toHaveProperty("cancelledAt");
    expect(data).not.toHaveProperty("orderItems");
    expect(data).not.toHaveProperty("specimenType");
  });

  it("returns the record returned by the client", async () => {
    const row = { id: TEST_IDS.id, status: SpecimenStatus.COLLECTED };
    const { db } = makeDatabase(row);

    await expect(collectSpecimen(db, makeParams())).resolves.toBe(row);
  });

  it("propagates persistence failures so the caller's transaction can roll back", async () => {
    const error = new Error("connection reset by peer");
    const { db, update } = makeDatabase();
    update.mockRejectedValueOnce(error);

    await expect(collectSpecimen(db, makeParams())).rejects.toBe(error);
  });
});
