import {
  LabOrderItemStatus,
  LabOrderPriority,
  LabOrderStatus,
  SpecimenStatus,
} from "@/generated/prisma";
import {
  LAB_ORDER_PRIORITY_RANK,
  compareWorklistOrders,
  getAssignedSpecimens,
  getWorklistAction,
  hasCollectedSpecimen,
  isWorklistOrder,
  type SpecimenAssignmentOrder,
  type SpecimenAssignmentOrderItem,
} from "../helpers";

/**
 * The worklist only reads a slice of the serialized order list row, so the
 * fixtures describe that slice and are cast to the full row types.
 */
function makeSpecimen({
  id = "specimen_1",
  status = SpecimenStatus.PENDING,
}: {
  id?: string;
  status?: SpecimenStatus;
} = {}) {
  return {
    id,
    no: "2601050001",
    status,
    specimenType: { id: "specimen_type_1", displayName: "Whole blood" },
  };
}

function makeItem({
  id = "item_1",
  status = LabOrderItemStatus.ORDERED,
  assignment = makeSpecimen(),
}: {
  id?: string;
  status?: LabOrderItemStatus;
  /** `null` leaves the item without an active specimen. */
  assignment?: ReturnType<typeof makeSpecimen> | null;
} = {}) {
  return {
    id,
    status,
    specimens:
      assignment === null ? [] : [{ endedAt: null, specimen: assignment }],
  } as unknown as SpecimenAssignmentOrderItem;
}

function makeOrder({
  items = [makeItem()],
  priority = LabOrderPriority.ROUTINE,
  orderedAt = "2026-01-05T08:00:00.000Z",
  status = LabOrderStatus.ORDERED,
  hasPatient = true,
}: {
  items?: SpecimenAssignmentOrderItem[];
  priority?: LabOrderPriority;
  orderedAt?: string;
  status?: LabOrderStatus;
  hasPatient?: boolean;
} = {}) {
  return {
    id: "lab_order_1",
    no: "2601050001",
    status,
    priority,
    orderedAt,
    patient: hasPatient
      ? { id: "patient_1", name: "Pat Doe", mrn: "MRN-1" }
      : null,
    items,
  } as unknown as SpecimenAssignmentOrder;
}

describe("getWorklistAction", () => {
  it("assigns while an item has no active specimen", () => {
    expect(
      getWorklistAction(
        makeOrder({
          items: [
            makeItem({ id: "assigned" }),
            makeItem({ id: "open", assignment: null }),
          ],
        }),
      ),
    ).toBe("ASSIGN");
  });

  it("offers the label once every item is assigned", () => {
    expect(getWorklistAction(makeOrder())).toBe("PRINT_LABEL");
  });

  it("assigns again once an assignment has ended", () => {
    // Reassigning or cancelling a specimen ends its assignment, which leaves the
    // item without an active specimen again.
    expect(
      getWorklistAction(
        makeOrder({
          items: [
            {
              id: "item_1",
              status: LabOrderItemStatus.ORDERED,
              specimens: [
                {
                  endedAt: "2026-01-05T09:00:00.000Z",
                  specimen: makeSpecimen(),
                },
              ],
            } as unknown as SpecimenAssignmentOrderItem,
          ],
        }),
      ),
    ).toBe("ASSIGN");
  });

  it.each([SpecimenStatus.COLLECTED, SpecimenStatus.RECEIVED])(
    "leaves an order with a %s specimen off the worklist",
    (status) => {
      expect(
        getWorklistAction(
          makeOrder({
            items: [makeItem({ assignment: makeSpecimen({ status }) })],
          }),
        ),
      ).toBeNull();
    },
  );

  it("ignores cancelled items", () => {
    expect(
      getWorklistAction(
        makeOrder({
          items: [
            makeItem({ id: "assigned" }),
            makeItem({
              id: "cancelled",
              status: LabOrderItemStatus.CANCELLED,
              assignment: null,
            }),
          ],
        }),
      ),
    ).toBe("PRINT_LABEL");
  });

  it("leaves an order without eligible items off the worklist", () => {
    expect(
      getWorklistAction(
        makeOrder({
          items: [
            makeItem({
              status: LabOrderItemStatus.CANCELLED,
              assignment: null,
            }),
          ],
        }),
      ),
    ).toBeNull();
  });

  it("leaves an order without a patient off the worklist", () => {
    expect(getWorklistAction(makeOrder({ hasPatient: false }))).toBeNull();
  });

  it.each([LabOrderStatus.CANCELLED, LabOrderStatus.COMPLETED])(
    "leaves a %s order off the worklist",
    (status) => {
      expect(getWorklistAction(makeOrder({ status }))).toBeNull();
    },
  );
});

describe("isWorklistOrder", () => {
  it("keeps an assigned order that still needs its labels", () => {
    expect(isWorklistOrder(makeOrder())).toBe(true);
  });

  it("drops an order whose specimen was collected", () => {
    expect(
      isWorklistOrder(
        makeOrder({
          items: [
            makeItem({
              assignment: makeSpecimen({ status: SpecimenStatus.COLLECTED }),
            }),
          ],
        }),
      ),
    ).toBe(false);
  });
});

describe("hasCollectedSpecimen", () => {
  it("is true once one of the assigned specimens was collected", () => {
    expect(
      hasCollectedSpecimen(
        makeOrder({
          items: [
            makeItem({ id: "pending" }),
            makeItem({
              id: "collected",
              assignment: makeSpecimen({
                id: "specimen_2",
                status: SpecimenStatus.COLLECTED,
              }),
            }),
          ],
        }),
      ),
    ).toBe(true);
  });

  it("is false while every specimen is still pending", () => {
    expect(hasCollectedSpecimen(makeOrder())).toBe(false);
  });
});

describe("getAssignedSpecimens", () => {
  it("collapses the specimen two items share", () => {
    const specimen = makeSpecimen();

    expect(
      getAssignedSpecimens(
        makeOrder({
          items: [
            makeItem({ id: "chemistry", assignment: specimen }),
            makeItem({ id: "hematology", assignment: specimen }),
          ],
        }),
      ).map(({ id }) => id),
    ).toEqual(["specimen_1"]);
  });

  it("skips unassigned and cancelled items", () => {
    expect(
      getAssignedSpecimens(
        makeOrder({
          items: [
            makeItem({ id: "assigned" }),
            makeItem({ id: "open", assignment: null }),
            makeItem({
              id: "cancelled",
              status: LabOrderItemStatus.CANCELLED,
              assignment: makeSpecimen({ id: "specimen_2" }),
            }),
          ],
        }),
      ).map(({ id }) => id),
    ).toEqual(["specimen_1"]);
  });
});

describe("LAB_ORDER_PRIORITY_RANK", () => {
  it("ranks STAT before URGENT before ROUTINE", () => {
    expect(LAB_ORDER_PRIORITY_RANK).toEqual({
      [LabOrderPriority.STAT]: 0,
      [LabOrderPriority.URGENT]: 1,
      [LabOrderPriority.ROUTINE]: 2,
    });
  });
});

describe("compareWorklistOrders", () => {
  it("sorts the most urgent order first", () => {
    const orders = [
      makeOrder({ priority: LabOrderPriority.ROUTINE }),
      makeOrder({ priority: LabOrderPriority.STAT }),
      makeOrder({ priority: LabOrderPriority.URGENT }),
    ];

    expect(
      orders.sort(compareWorklistOrders).map(({ priority }) => priority),
    ).toEqual([
      LabOrderPriority.STAT,
      LabOrderPriority.URGENT,
      LabOrderPriority.ROUTINE,
    ]);
  });

  it("sorts the order that has been waiting the longest first within a priority", () => {
    const orders = [
      makeOrder({ orderedAt: "2026-01-05T10:00:00.000Z" }),
      makeOrder({ orderedAt: "2026-01-05T08:00:00.000Z" }),
    ];

    expect(
      orders.sort(compareWorklistOrders).map(({ orderedAt }) => orderedAt),
    ).toEqual(["2026-01-05T08:00:00.000Z", "2026-01-05T10:00:00.000Z"]);
  });

  it("puts priority ahead of the order date", () => {
    const stat = makeOrder({
      priority: LabOrderPriority.STAT,
      orderedAt: "2026-01-06T08:00:00.000Z",
    });
    const routine = makeOrder({
      priority: LabOrderPriority.ROUTINE,
      orderedAt: "2026-01-05T08:00:00.000Z",
    });

    expect(compareWorklistOrders(stat, routine)).toBeLessThan(0);
    expect(compareWorklistOrders(routine, stat)).toBeGreaterThan(0);
  });
});
