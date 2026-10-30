import prisma from "@/lib/prisma";
import { SpecimenStatus } from "@/generated/prisma";
import { specimenDetailSelect } from "../specimen.select";
import {
  collectSpecimen,
  createSpecimen,
  getSpecimen,
  receiveSpecimen,
  reserveSpecimenNo,
  updateSpecimen,
} from "../specimen.service";

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

type CounterClient = Parameters<typeof reserveSpecimenNo>[0];
type SpecimenClient = Pick<typeof prisma, "specimen">;

function makeCounterDatabase(sequence = 1) {
  const upsert = jest.fn().mockResolvedValue({ sequence });
  const db = {
    specimenCounter: { upsert },
  } as unknown as CounterClient;

  return { db, upsert };
}

function makeSpecimenDatabase(methods: Record<string, jest.Mock>) {
  return { specimen: methods } as unknown as SpecimenClient;
}

describe("reserveSpecimenNo", () => {
  it("takes the next sequence of the period derived from the date", async () => {
    const { db, upsert } = makeCounterDatabase(41);

    await expect(
      reserveSpecimenNo(db, { date: new Date(2026, 0, 5) }),
    ).resolves.toEqual({ no: "2601050041", period: "260105", sequence: 41 });

    // The counter is keyed by period and incremented atomically, so two
    // simultaneous collections can never be handed the same number.
    expect(upsert).toHaveBeenCalledWith({
      where: { period: "260105" },
      create: { period: "260105", sequence: 1 },
      update: { sequence: { increment: 1 } },
      select: { sequence: true },
    });
  });

  it("rolls the period over at midnight", async () => {
    const { db, upsert } = makeCounterDatabase();

    await reserveSpecimenNo(db, { date: new Date(2026, 11, 31, 23, 59, 59) });
    await reserveSpecimenNo(db, { date: new Date(2027, 0, 1, 0, 0, 0) });

    expect(upsert.mock.calls.map(([args]) => args.where)).toEqual([
      { period: "261231" },
      { period: "270101" },
    ]);
  });

  it("propagates a failure to reserve a number", async () => {
    const error = new Error("counter row is locked");
    const { db, upsert } = makeCounterDatabase();
    upsert.mockRejectedValueOnce(error);

    await expect(
      reserveSpecimenNo(db, { date: new Date(2026, 0, 5) }),
    ).rejects.toBe(error);
  });
});

const createParams: Parameters<typeof createSpecimen>[1] = {
  no: "2601050001",
  period: "260105",
  sequence: 1,
  patientId: TEST_IDS.id,
  labOrderId: TEST_IDS.labOrderId,
  orderItemIds: ["cz1x2c3v4b5n6m7q8w9e0r1t", "cv4b5n6m7q8w9e0r1t2y3u4i"],
  laboratoryId: TEST_IDS.laboratoryId,
  specimenTypeId: "ca1s2d3f4g5h6j7k8l9z0x1c2",
};

describe("createSpecimen", () => {
  it("creates a pending specimen that assigns every selected order item", async () => {
    const row = { id: TEST_IDS.id, status: SpecimenStatus.PENDING };
    const create = jest.fn().mockResolvedValue(row);
    const db = makeSpecimenDatabase({ create });

    await expect(createSpecimen(db, createParams)).resolves.toBe(row);

    const args = create.mock.calls[0][0] as {
      data: Record<string, unknown>;
      select: unknown;
    };

    expect(args.data).toEqual({
      no: "2601050001",
      period: "260105",
      sequence: 1,
      status: SpecimenStatus.PENDING,
      patient: { connect: { id: TEST_IDS.id } },
      labOrder: { connect: { id: TEST_IDS.labOrderId } },
      laboratory: { connect: { id: TEST_IDS.laboratoryId } },
      orderItems: {
        create: createParams.orderItemIds.map((id) => ({
          laboratory: { connect: { id: TEST_IDS.laboratoryId } },
          labOrderItem: { connect: { id } },
        })),
      },
      specimenType: { connect: { id: createParams.specimenTypeId } },
    });
    expect(args.select).toBe(specimenDetailSelect);
  });

  it("propagates persistence failures so the caller's transaction can roll back", async () => {
    const error = new Error("duplicate specimen no.");
    const create = jest.fn().mockRejectedValueOnce(error);
    const db = makeSpecimenDatabase({ create });

    await expect(createSpecimen(db, createParams)).rejects.toBe(error);
  });
});

describe("getSpecimen", () => {
  it("scopes the lookup to the caller's laboratory", async () => {
    const row = { id: TEST_IDS.id };
    const findFirst = jest.fn().mockResolvedValue(row);
    const db = makeSpecimenDatabase({ findFirst });

    await expect(
      getSpecimen(db, { id: TEST_IDS.id, laboratoryId: TEST_IDS.laboratoryId }),
    ).resolves.toBe(row);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: TEST_IDS.id, laboratoryId: TEST_IDS.laboratoryId },
      select: specimenDetailSelect,
    });
  });

  it("returns null when the specimen belongs to another laboratory", async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const db = makeSpecimenDatabase({ findFirst });

    await expect(
      getSpecimen(db, { id: TEST_IDS.id, laboratoryId: TEST_IDS.laboratoryId }),
    ).resolves.toBeNull();
  });
});

describe("updateSpecimen", () => {
  const baseParams: Parameters<typeof updateSpecimen>[1] = {
    id: TEST_IDS.id,
    labOrderId: TEST_IDS.labOrderId,
    laboratoryId: TEST_IDS.laboratoryId,
  };

  function updateArgs(update: jest.Mock) {
    expect(update).toHaveBeenCalledTimes(1);

    return update.mock.calls[0][0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
      select: unknown;
    };
  }

  it("updates the specimen scoped to its laboratory", async () => {
    const row = { id: TEST_IDS.id };
    const update = jest.fn().mockResolvedValue(row);
    const db = makeSpecimenDatabase({ update });

    await expect(
      updateSpecimen(db, { ...baseParams, note: "lipemic" }),
    ).resolves.toBe(row);

    const args = updateArgs(update);

    expect(args.where).toEqual({
      id: TEST_IDS.id,
      laboratoryId: TEST_IDS.laboratoryId,
    });
    expect(args.data.note).toBe("lipemic");
    expect(args.select).toBe(specimenDetailSelect);
  });

  it("assigns the order items and switches the specimen type when both are supplied", async () => {
    const update = jest.fn().mockResolvedValue({ id: TEST_IDS.id });
    const db = makeSpecimenDatabase({ update });

    await updateSpecimen(db, {
      ...baseParams,
      orderItemIds: ["cz1x2c3v4b5n6m7q8w9e0r1t"],
      specimenTypeId: "ca1s2d3f4g5h6j7k8l9z0x1c2",
    });

    const { data } = updateArgs(update);

    expect(data.orderItems).toEqual({
      create: [
        {
          laboratory: { connect: { id: TEST_IDS.laboratoryId } },
          labOrderItem: { connect: { id: "cz1x2c3v4b5n6m7q8w9e0r1t" } },
        },
      ],
    });
    expect(data.specimenType).toEqual({
      connect: { id: "ca1s2d3f4g5h6j7k8l9z0x1c2" },
    });
  });

  it("leaves the assignments and the specimen type untouched when they are omitted", async () => {
    const update = jest.fn().mockResolvedValue({ id: TEST_IDS.id });
    const db = makeSpecimenDatabase({ update });

    await updateSpecimen(db, baseParams);

    const { data } = updateArgs(update);

    // `undefined` keeps the stored relations, which is what a plain field
    // correction needs; a reassignment always supplies both.
    expect(data).toHaveProperty("orderItems");
    expect(data.orderItems).toBeUndefined();
    expect(data).toHaveProperty("specimenType");
    expect(data.specimenType).toBeUndefined();
  });

  it("writes the rejection and cancellation records when they are supplied", async () => {
    const update = jest.fn().mockResolvedValue({ id: TEST_IDS.id });
    const db = makeSpecimenDatabase({ update });
    const rejectedAt = new Date("2026-10-27T11:00:00.000Z");
    const cancelledAt = new Date("2026-10-27T12:00:00.000Z");

    await updateSpecimen(db, {
      ...baseParams,
      status: SpecimenStatus.REJECTED,
      rejectedAt,
      cancellationReason: "DUPLICATE_SPECIMEN",
      cancelledAt,
    });

    expect(updateArgs(update).data).toMatchObject({
      status: SpecimenStatus.REJECTED,
      rejectedAt,
      cancellationReason: "DUPLICATE_SPECIMEN",
      cancelledAt,
    });
  });

  it("propagates persistence failures so the caller's transaction can roll back", async () => {
    const error = new Error("record to update not found");
    const update = jest.fn().mockRejectedValueOnce(error);
    const db = makeSpecimenDatabase({ update });

    await expect(updateSpecimen(db, baseParams)).rejects.toBe(error);
  });
});
