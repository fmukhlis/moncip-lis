import { LabOrderItemStatus } from "@/generated/prisma";
import {
  ensureLabOrderItemHasNoActiveSpecimen,
  ensureLabOrderItemsAreAssignedToSpecimens,
  getUnassignedLabOrderItems,
  hasActiveSpecimenAssignment,
  isLabOrderFullyAssigned,
  isSpecimenAssignedToLabOrder,
} from "../lab-order-item.policy";

const assignedAt = new Date("2026-10-27T09:00:00.000Z");
const endedAt = new Date("2026-10-27T10:00:00.000Z");

describe("ensureLabOrderItemHasNoActiveSpecimen", () => {
  it("allows an item that was never assigned", () => {
    expect(() =>
      ensureLabOrderItemHasNoActiveSpecimen({ specimens: [] }),
    ).not.toThrow();
  });

  it("allows an item whose assignments have all ended", () => {
    expect(() =>
      ensureLabOrderItemHasNoActiveSpecimen({
        specimens: [{ endedAt }, { endedAt }],
      }),
    ).not.toThrow();
  });

  it("blocks an item that still has an active assignment", () => {
    expect(() =>
      ensureLabOrderItemHasNoActiveSpecimen({
        specimens: [{ endedAt: null }],
      }),
    ).toThrow("Lab order item already has an active specimen");
  });

  it("blocks an item with a mix of active and ended assignments", () => {
    expect(() =>
      ensureLabOrderItemHasNoActiveSpecimen({
        specimens: [{ endedAt }, { endedAt: null }],
      }),
    ).toThrow("Lab order item already has an active specimen");
  });

  it("treats a missing end timestamp as active", () => {
    // `assignedAt` is irrelevant; only the presence of `endedAt` ends an
    // assignment, which is why an undefined end date blocks the item.
    expect(() =>
      ensureLabOrderItemHasNoActiveSpecimen({
        specimens: [{ assignedAt, endedAt: undefined } as never],
      }),
    ).toThrow("Lab order item already has an active specimen");
  });
});

describe("hasActiveSpecimenAssignment", () => {
  it("counts an item as assigned while an assignment has not ended", () => {
    expect(
      hasActiveSpecimenAssignment({ specimens: [{ endedAt: null }] }),
    ).toBe(true);
  });

  it("counts an item whose assignments have all ended as unassigned", () => {
    expect(hasActiveSpecimenAssignment({ specimens: [{ endedAt }] })).toBe(
      false,
    );
  });

  it("counts an item without assignments as unassigned", () => {
    expect(hasActiveSpecimenAssignment({ specimens: [] })).toBe(false);
  });

  it("accepts a serialized end date", () => {
    // The list query serializes dates, so the same rule has to read strings.
    expect(
      hasActiveSpecimenAssignment({
        specimens: [{ endedAt: "2026-10-27T10:00:00.000Z" }],
      }),
    ).toBe(false);
  });
});

describe("isSpecimenAssignedToLabOrder", () => {
  const specimen = (id: string, endedAt: Date | null = null) => ({
    endedAt,
    specimen: { id },
  });

  it("finds the specimen through an active assignment of an order item", () => {
    expect(
      isSpecimenAssignedToLabOrder(
        [
          { specimens: [specimen("specimen_1")] },
          { specimens: [specimen("specimen_2")] },
        ],
        "specimen_2",
      ),
    ).toBe(true);
  });

  it("finds the specimen through an ended assignment as well", () => {
    // The ended assignment is the history of the specimen, and it is what keeps
    // a cancelled or rejected specimen part of the order.
    expect(
      isSpecimenAssignedToLabOrder(
        [{ specimens: [specimen("specimen_1", endedAt)] }],
        "specimen_1",
      ),
    ).toBe(true);
  });

  it("is false when the order items carry another specimen", () => {
    expect(
      isSpecimenAssignedToLabOrder(
        [{ specimens: [specimen("specimen_1")] }],
        "specimen_2",
      ),
    ).toBe(false);
  });

  it("is false for an order without any assignment", () => {
    expect(
      isSpecimenAssignedToLabOrder([{ specimens: [] }], "specimen_1"),
    ).toBe(false);
    expect(isSpecimenAssignedToLabOrder([], "specimen_1")).toBe(false);
  });
});

describe("getUnassignedLabOrderItems", () => {
  it("returns the items without an active specimen and skips cancelled ones", () => {
    const items = [
      { id: "unassigned", status: LabOrderItemStatus.ORDERED, specimens: [] },
      {
        id: "reassigned",
        status: LabOrderItemStatus.ORDERED,
        specimens: [{ endedAt }, { endedAt: null }],
      },
      {
        id: "assigned",
        status: LabOrderItemStatus.ORDERED,
        specimens: [{ endedAt: null }],
      },
      { id: "cancelled", status: LabOrderItemStatus.CANCELLED, specimens: [] },
    ];

    expect(getUnassignedLabOrderItems(items).map(({ id }) => id)).toEqual([
      "unassigned",
    ]);
  });
});

describe("isLabOrderFullyAssigned", () => {
  it("is true when every eligible item has an active specimen", () => {
    expect(
      isLabOrderFullyAssigned([
        { status: LabOrderItemStatus.ORDERED, specimens: [{ endedAt: null }] },
      ]),
    ).toBe(true);
  });

  it("is false while one eligible item has no active specimen", () => {
    expect(
      isLabOrderFullyAssigned([
        { status: LabOrderItemStatus.ORDERED, specimens: [{ endedAt: null }] },
        { status: LabOrderItemStatus.ORDERED, specimens: [] },
      ]),
    ).toBe(false);
  });

  it("ignores cancelled items", () => {
    expect(
      isLabOrderFullyAssigned([
        { status: LabOrderItemStatus.ORDERED, specimens: [{ endedAt: null }] },
        { status: LabOrderItemStatus.CANCELLED, specimens: [] },
      ]),
    ).toBe(true);
  });

  it("is true for an order without eligible items", () => {
    expect(
      isLabOrderFullyAssigned([
        { status: LabOrderItemStatus.CANCELLED, specimens: [] },
      ]),
    ).toBe(true);
  });
});

describe("ensureLabOrderItemsAreAssignedToSpecimens", () => {
  it("allows a fully assigned order", () => {
    expect(() =>
      ensureLabOrderItemsAreAssignedToSpecimens([
        { status: LabOrderItemStatus.ORDERED, specimens: [{ endedAt: null }] },
      ]),
    ).not.toThrow();
  });

  it("blocks a collection while an eligible item has no active specimen", () => {
    expect(() =>
      ensureLabOrderItemsAreAssignedToSpecimens([
        { status: LabOrderItemStatus.ORDERED, specimens: [{ endedAt: null }] },
        { status: LabOrderItemStatus.ORDERED, specimens: [] },
      ]),
    ).toThrow(
      "Every lab order item must be assigned to an active specimen before collection",
    );
  });
});
