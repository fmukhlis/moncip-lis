import prisma from "@/lib/prisma";
import { SpecimenStatus } from "@/generated/prisma";
import { specimenDetailSelect } from "../specimen.select";
import { collectSpecimen, receiveSpecimen } from "../specimen.service";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {},
}));

const TEST_IDS = {
  id: "tz4a98xxat96iws9zmbrgj3a",
  labOrderId: "ckqp6y6q50000qzrm8b1v3f7d",
  collectedById: "clx1a2b3c4d5e6f7g8h9i0jk",
  receivedById: "cm9z8y7x6w5v4u3t2s1r0qpo",
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

  it("never touches the receipt, cancellation or assignment fields", async () => {
    const { db, update } = makeDatabase();

    // Correcting the collection record of a received specimen keeps its status:
    // the caller resolves it through `resolveCollectedStatus`.
    await collectSpecimen(db, makeParams({ status: SpecimenStatus.RECEIVED }));

    const { data } = firstUpdateArgs(update);

    expect(data.status).toBe(SpecimenStatus.RECEIVED);
    expect(data).not.toHaveProperty("receivedAt");
    expect(data).not.toHaveProperty("receivedById");
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

const receivedAt = new Date("2026-10-27T10:15:00.000Z");

function makeReceiveParams(
  overrides: Partial<Parameters<typeof receiveSpecimen>[1]> = {},
): Parameters<typeof receiveSpecimen>[1] {
  return {
    id: TEST_IDS.id,
    labOrderId: TEST_IDS.labOrderId,
    laboratoryId: TEST_IDS.laboratoryId,
    receivedAt,
    receivedById: TEST_IDS.receivedById,
    status: SpecimenStatus.RECEIVED,
    ...overrides,
  };
}

describe("receiveSpecimen", () => {
  it("updates the specimen scoped to its laboratory", async () => {
    const { db, update } = makeDatabase();

    await receiveSpecimen(db, makeReceiveParams());

    const args = firstUpdateArgs(update);

    expect(args.where).toEqual({
      id: TEST_IDS.id,
      laboratoryId: TEST_IDS.laboratoryId,
    });
    expect(args.select).toBe(specimenDetailSelect);
  });

  it("writes the status, the receipt record and the note", async () => {
    const { db, update } = makeDatabase();

    await receiveSpecimen(db, makeReceiveParams({ note: "hemolysed sample" }));

    expect(firstUpdateArgs(update).data).toEqual({
      status: SpecimenStatus.RECEIVED,
      receivedAt,
      receivedById: TEST_IDS.receivedById,
      note: "hemolysed sample",
    });
  });

  it("writes only the receipt fields, leaving the note untouched when it is omitted", async () => {
    const { db, update } = makeDatabase();

    await receiveSpecimen(db, makeReceiveParams());

    const { data } = firstUpdateArgs(update);

    expect(data).toHaveProperty("note");
    expect(data.note).toBeUndefined();
    expect(Object.keys(data).sort()).toEqual(
      ["note", "receivedAt", "receivedById", "status"].sort(),
    );
  });

  it("clears the note when an empty string is supplied", async () => {
    const { db, update } = makeDatabase();

    await receiveSpecimen(db, makeReceiveParams({ note: "" }));

    expect(firstUpdateArgs(update).data.note).toBeNull();
  });

  it("keeps the collection record and the assignment history untouched", async () => {
    const { db, update } = makeDatabase();

    // Correcting the receipt record keeps the status resolved by the caller and
    // updates only the receipt fields.
    await receiveSpecimen(
      db,
      makeReceiveParams({
        status: SpecimenStatus.RECEIVED,
        note: "stored in the cold room",
      }),
    );

    const { data } = firstUpdateArgs(update);

    expect(data.status).toBe(SpecimenStatus.RECEIVED);
    expect(data.note).toBe("stored in the cold room");
    expect(data).not.toHaveProperty("collectedAt");
    expect(data).not.toHaveProperty("collectedById");
    expect(data).not.toHaveProperty("rejectedAt");
    expect(data).not.toHaveProperty("cancelledAt");
    expect(data).not.toHaveProperty("orderItems");
    expect(data).not.toHaveProperty("specimenType");
  });

  it("returns the record returned by the client", async () => {
    const row = { id: TEST_IDS.id, status: SpecimenStatus.RECEIVED };
    const { db } = makeDatabase(row);

    await expect(receiveSpecimen(db, makeReceiveParams())).resolves.toBe(row);
  });

  it("propagates persistence failures so the caller's transaction can roll back", async () => {
    const error = new Error("connection reset by peer");
    const { db, update } = makeDatabase();
    update.mockRejectedValueOnce(error);

    await expect(receiveSpecimen(db, makeReceiveParams())).rejects.toBe(error);
  });
});
