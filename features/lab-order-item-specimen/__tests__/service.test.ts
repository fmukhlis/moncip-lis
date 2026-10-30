import prisma from "@/lib/prisma";
import { SpecimenAssignmentEndReason } from "@/generated/prisma";
import {
  createLabOrderItemSpecimen,
  updateManyLabOrderItemSpecimen,
} from "../lab-order-item-specimen.service";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {},
}));

const TEST_IDS = {
  specimenId: "tz4a98xxat96iws9zmbrgj3a",
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
  labOrderItemId: "ckqp6y6q50000qzrm8b1v3f7d",
} as const;

const endedAt = new Date("2026-10-27T10:15:00.000Z");

type UpdateManyArgs = {
  where: Record<string, unknown>;
  data: Record<string, unknown>;
};

function makeDatabase(created: unknown = { id: "lab_order_item_specimen" }) {
  const create = jest.fn().mockResolvedValue(created);
  const updateMany = jest.fn().mockResolvedValue({ count: 1 });
  const db = {
    labOrderItemSpecimen: { create, updateMany },
  } as unknown as Pick<typeof prisma, "labOrderItemSpecimen">;

  return { db, create, updateMany };
}

function firstCreateArgs(create: jest.Mock) {
  expect(create).toHaveBeenCalledTimes(1);

  return create.mock.calls[0][0] as { data: Record<string, unknown> };
}

function firstUpdateManyArgs(updateMany: jest.Mock): UpdateManyArgs {
  expect(updateMany).toHaveBeenCalledTimes(1);

  return updateMany.mock.calls[0][0] as UpdateManyArgs;
}

describe("createLabOrderItemSpecimen", () => {
  it("connects the specimen, the laboratory and the order item", async () => {
    const { db, create } = makeDatabase();

    await createLabOrderItemSpecimen(db, TEST_IDS);

    expect(firstCreateArgs(create).data).toEqual({
      specimen: { connect: { id: TEST_IDS.specimenId } },
      laboratory: { connect: { id: TEST_IDS.laboratoryId } },
      labOrderItem: { connect: { id: TEST_IDS.labOrderItemId } },
    });
  });

  it("returns the assignment created by the client", async () => {
    const row = { id: "lab_order_item_specimen" };
    const { db } = makeDatabase(row);

    await expect(createLabOrderItemSpecimen(db, TEST_IDS)).resolves.toBe(row);
  });

  it("propagates persistence failures so the caller's transaction can roll back", async () => {
    const error = new Error("connection reset by peer");
    const { db, create } = makeDatabase();
    create.mockRejectedValueOnce(error);

    await expect(createLabOrderItemSpecimen(db, TEST_IDS)).rejects.toBe(error);
  });
});

describe("updateManyLabOrderItemSpecimen", () => {
  it("ends only the active assignments of the specimen in its laboratory", async () => {
    const { db, updateMany } = makeDatabase();

    await updateManyLabOrderItemSpecimen(db, {
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      endedAt,
      endReason: SpecimenAssignmentEndReason.REASSIGNED,
      onlyActive: true,
    });

    const { where, data } = firstUpdateManyArgs(updateMany);

    expect(where).toEqual({
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      endedAt: null,
    });
    expect(data).toEqual({
      endedAt,
      endReason: SpecimenAssignmentEndReason.REASSIGNED,
    });
  });

  it("rewrites the ended assignments when onlyActive is not requested", async () => {
    const { db, updateMany } = makeDatabase();

    await updateManyLabOrderItemSpecimen(db, {
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      endedAt,
      endReason: SpecimenAssignmentEndReason.SPECIMEN_CANCELLED,
    });

    expect(firstUpdateManyArgs(updateMany).where).toEqual({
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
    });
  });

  it("leaves the excluded order items assigned", async () => {
    const { db, updateMany } = makeDatabase();

    await updateManyLabOrderItemSpecimen(db, {
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      endedAt,
      endReason: SpecimenAssignmentEndReason.REASSIGNED,
      onlyActive: true,
      excludedLabOrderItemIds: [TEST_IDS.labOrderItemId],
    });

    expect(firstUpdateManyArgs(updateMany).where).toEqual({
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      endedAt: null,
      labOrderItemId: { notIn: [TEST_IDS.labOrderItemId] },
    });
  });

  it("passes an empty exclusion list through as an empty notIn", async () => {
    // Pinned: an empty array is truthy, so callers must omit the field instead
    // of passing `[]`. See the reassignment flow in `specimen.action.ts`.
    const { db, updateMany } = makeDatabase();

    await updateManyLabOrderItemSpecimen(db, {
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      endedAt,
      onlyActive: true,
      excludedLabOrderItemIds: [],
    });

    expect(firstUpdateManyArgs(updateMany).where).toEqual({
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      endedAt: null,
      labOrderItemId: { notIn: [] },
    });
  });

  it("writes the end timestamp even when no reason is given", async () => {
    const { db, updateMany } = makeDatabase();

    await updateManyLabOrderItemSpecimen(db, {
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      endedAt,
      onlyActive: false,
    });

    expect(firstUpdateManyArgs(updateMany).data).toEqual({
      endedAt,
      endReason: undefined,
    });
  });

  it("returns the update count reported by the client", async () => {
    const { db } = makeDatabase();

    await expect(
      updateManyLabOrderItemSpecimen(db, {
        specimenId: TEST_IDS.specimenId,
        laboratoryId: TEST_IDS.laboratoryId,
        endedAt,
      }),
    ).resolves.toEqual({ count: 1 });
  });

  it("propagates persistence failures so the caller's transaction can roll back", async () => {
    const error = new Error("connection reset by peer");
    const { db, updateMany } = makeDatabase();
    updateMany.mockRejectedValueOnce(error);

    await expect(
      updateManyLabOrderItemSpecimen(db, {
        specimenId: TEST_IDS.specimenId,
        laboratoryId: TEST_IDS.laboratoryId,
        endedAt,
      }),
    ).rejects.toBe(error);
  });
});
