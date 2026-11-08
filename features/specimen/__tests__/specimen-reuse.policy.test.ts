import {
  LabOrderItemStatus,
  LabOrderStatus,
  SpecimenStatus,
} from "@/generated/prisma";
import {
  ASSIGNABLE_SPECIMEN_STATUSES,
  SPECIMEN_REUSE_INELIGIBILITY_MESSAGE,
  SPECIMEN_REUSE_ORDER_INELIGIBILITY_MESSAGE,
  ensureSpecimenReuseTargetItemsAreEligible,
  ensureSpecimenReuseTargetOrderIsEligible,
  getSpecimenReuseCandidates,
  getSpecimenReuseItemIneligibility,
  getSpecimenReuseOrderIneligibility,
  isSpecimenAssignable,
  isSpecimenReuseTargetOrder,
  isSpecimenTypeCompatible,
} from "../specimen-reuse.policy";

const TEST_IDS = {
  patientId: "ca1s2d3f4g5h6j7k8l9z0x1c2",
  otherPatientId: "cb2n3m4k5j6h7g8f9d0s1a2q",
  specimenTypeId: "cv4b5n6m7q8w9e0r1t2y3u4i",
  otherSpecimenTypeId: "cw5c6v7b8n9m0q1w2e3r4t5y",
  itemId: "c9wq3x1v70000qzrm5t2h8k4d",
  otherItemId: "c1b2n3m4k5j6h7g8f9d0s1a2",
} as const;

const specimenOfType = { specimenType: { id: TEST_IDS.specimenTypeId } };

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: TEST_IDS.itemId,
    status: LabOrderItemStatus.ORDERED,
    specimens: [],
    performable: {
      displayName: "Complete blood count",
      specimenTypes: [{ specimenType: { id: TEST_IDS.specimenTypeId } }],
    },
    ...overrides,
  };
}

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    status: LabOrderStatus.ORDERED,
    patient: { id: TEST_IDS.patientId },
    items: [makeItem()],
    ...overrides,
  };
}

function makeSpecimen(overrides: Record<string, unknown> = {}) {
  return {
    patientId: TEST_IDS.patientId,
    specimenType: { id: TEST_IDS.specimenTypeId },
    ...overrides,
  };
}

describe("specimen statuses", () => {
  it("assigns from the statuses that can still be edited", () => {
    expect(ASSIGNABLE_SPECIMEN_STATUSES).toEqual([
      SpecimenStatus.PENDING,
      SpecimenStatus.COLLECTED,
      SpecimenStatus.RECEIVED,
    ]);
  });

  it.each([
    SpecimenStatus.PENDING,
    SpecimenStatus.COLLECTED,
    SpecimenStatus.RECEIVED,
  ])("treats a %s specimen as assignable", (status) => {
    expect(isSpecimenAssignable(status)).toBe(true);
  });

  it.each([SpecimenStatus.CANCELLED, SpecimenStatus.REJECTED])(
    "treats a %s specimen as not assignable",
    (status) => {
      expect(isSpecimenAssignable(status)).toBe(false);
    },
  );
});

describe("isSpecimenTypeCompatible", () => {
  it("accepts an item whose performable lists the specimen type", () => {
    expect(isSpecimenTypeCompatible(makeItem(), specimenOfType)).toBe(true);
  });

  it("accepts the specimen type among several performable types", () => {
    const item = makeItem({
      performable: {
        specimenTypes: [
          { specimenType: { id: TEST_IDS.otherSpecimenTypeId } },
          { specimenType: { id: TEST_IDS.specimenTypeId } },
        ],
      },
    });

    expect(isSpecimenTypeCompatible(item, specimenOfType)).toBe(true);
  });

  it("refuses an item whose performable lists other specimen types", () => {
    const item = makeItem({
      performable: {
        specimenTypes: [{ specimenType: { id: TEST_IDS.otherSpecimenTypeId } }],
      },
    });

    expect(isSpecimenTypeCompatible(item, specimenOfType)).toBe(false);
  });

  it("refuses an item whose performable has no specimen type", () => {
    expect(
      isSpecimenTypeCompatible(
        makeItem({ performable: { specimenTypes: [] } }),
        specimenOfType,
      ),
    ).toBe(false);
  });
});

describe("getSpecimenReuseItemIneligibility", () => {
  it("accepts an ordered, unassigned and compatible item", () => {
    expect(
      getSpecimenReuseItemIneligibility(makeItem(), specimenOfType),
    ).toBeNull();
  });

  it.each([
    LabOrderItemStatus.IN_PROCESS,
    LabOrderItemStatus.PRELIMINARY,
    LabOrderItemStatus.VERIFIED,
    LabOrderItemStatus.REJECTED,
    LabOrderItemStatus.TNP,
    LabOrderItemStatus.CANCELLED,
  ])("refuses a %s item", (status) => {
    expect(
      getSpecimenReuseItemIneligibility(makeItem({ status }), specimenOfType),
    ).toBe("NOT_ORDERED");
  });

  it("refuses an item that carries an active specimen", () => {
    const item = makeItem({ specimens: [{ endedAt: null }] });

    expect(getSpecimenReuseItemIneligibility(item, specimenOfType)).toBe(
      "ALREADY_ASSIGNED",
    );
  });

  it("accepts an item whose only assignments ended", () => {
    const item = makeItem({
      specimens: [{ endedAt: new Date("2026-01-05T08:00:00.000Z") }],
    });

    expect(getSpecimenReuseItemIneligibility(item, specimenOfType)).toBeNull();
  });

  // The client reads the serialized order, where the dates are strings.
  it("accepts the serialized dates of the client views", () => {
    const active = makeItem({ specimens: [{ endedAt: null }] });
    const ended = makeItem({
      specimens: [{ endedAt: "2026-01-05T08:00:00.000Z" }],
    });

    expect(getSpecimenReuseItemIneligibility(active, specimenOfType)).toBe(
      "ALREADY_ASSIGNED",
    );
    expect(getSpecimenReuseItemIneligibility(ended, specimenOfType)).toBeNull();
  });

  it("refuses an item of an incompatible specimen type", () => {
    const item = makeItem({
      performable: {
        specimenTypes: [{ specimenType: { id: TEST_IDS.otherSpecimenTypeId } }],
      },
    });

    expect(getSpecimenReuseItemIneligibility(item, specimenOfType)).toBe(
      "INCOMPATIBLE_SPECIMEN_TYPE",
    );
  });

  // The assignment is the stronger reason: the item already has a sample, so
  // whether the type fits only matters once that sample is gone.
  it("reports the active assignment before the specimen type", () => {
    const item = makeItem({
      specimens: [{ endedAt: null }],
      performable: {
        specimenTypes: [{ specimenType: { id: TEST_IDS.otherSpecimenTypeId } }],
      },
    });

    expect(getSpecimenReuseItemIneligibility(item, specimenOfType)).toBe(
      "ALREADY_ASSIGNED",
    );
  });

  it("reports the status before the other rules", () => {
    const item = makeItem({
      status: LabOrderItemStatus.IN_PROCESS,
      specimens: [{ endedAt: null }],
    });

    expect(getSpecimenReuseItemIneligibility(item, specimenOfType)).toBe(
      "NOT_ORDERED",
    );
  });
});

describe("getSpecimenReuseCandidates", () => {
  it("keeps every item and describes why it cannot take the specimen", () => {
    const order = makeOrder({
      items: [
        makeItem({ id: TEST_IDS.itemId }),
        makeItem({ id: TEST_IDS.otherItemId, specimens: [{ endedAt: null }] }),
      ],
    });

    expect(getSpecimenReuseCandidates(order, specimenOfType)).toEqual([
      { item: order.items[0], ineligibility: null },
      { item: order.items[1], ineligibility: "ALREADY_ASSIGNED" },
    ]);
  });
});

describe("isSpecimenReuseTargetOrder", () => {
  it.each([LabOrderStatus.ORDERED, LabOrderStatus.IN_PROCESS])(
    "accepts an editable %s order of the same patient",
    (status) => {
      expect(
        isSpecimenReuseTargetOrder(makeOrder({ status }), makeSpecimen()),
      ).toBe(true);
    },
  );

  it.each([LabOrderStatus.COMPLETED, LabOrderStatus.CANCELLED])(
    "refuses a %s order",
    (status) => {
      expect(
        isSpecimenReuseTargetOrder(makeOrder({ status }), makeSpecimen()),
      ).toBe(false);
    },
  );

  it("refuses an order of another patient", () => {
    const order = makeOrder({ patient: { id: TEST_IDS.otherPatientId } });

    expect(isSpecimenReuseTargetOrder(order, makeSpecimen())).toBe(false);
  });

  it("refuses a walk-in order without a patient", () => {
    expect(
      isSpecimenReuseTargetOrder(makeOrder({ patient: null }), makeSpecimen()),
    ).toBe(false);
  });
});

describe("getSpecimenReuseOrderIneligibility", () => {
  it("accepts an editable order of the same patient", () => {
    expect(
      getSpecimenReuseOrderIneligibility(makeOrder(), makeSpecimen()),
    ).toBe(null);
  });

  it.each([LabOrderStatus.COMPLETED, LabOrderStatus.CANCELLED])(
    "explains that a %s order can no longer be changed",
    (status) => {
      expect(
        getSpecimenReuseOrderIneligibility(
          makeOrder({ status }),
          makeSpecimen(),
        ),
      ).toBe("NOT_EDITABLE");
    },
  );

  it("explains that the order belongs to another patient", () => {
    const order = makeOrder({ patient: { id: TEST_IDS.otherPatientId } });

    expect(getSpecimenReuseOrderIneligibility(order, makeSpecimen())).toBe(
      "OTHER_PATIENT",
    );
  });
});

describe("ensureSpecimenReuseTargetOrderIsEligible", () => {
  it("accepts the order the assignment is made in", () => {
    expect(() =>
      ensureSpecimenReuseTargetOrderIsEligible(makeOrder(), makeSpecimen()),
    ).not.toThrow();
  });

  it.each([LabOrderStatus.COMPLETED, LabOrderStatus.CANCELLED])(
    "refuses a %s order with its own message",
    (status) => {
      expect(() =>
        ensureSpecimenReuseTargetOrderIsEligible(
          makeOrder({ status }),
          makeSpecimen(),
        ),
      ).toThrow(SPECIMEN_REUSE_ORDER_INELIGIBILITY_MESSAGE.NOT_EDITABLE);
    },
  );

  it("refuses an order of another patient with its own message", () => {
    const order = makeOrder({ patient: { id: TEST_IDS.otherPatientId } });

    expect(() =>
      ensureSpecimenReuseTargetOrderIsEligible(order, makeSpecimen()),
    ).toThrow(SPECIMEN_REUSE_ORDER_INELIGIBILITY_MESSAGE.OTHER_PATIENT);
  });

  it("refuses a walk-in order without a patient", () => {
    expect(() =>
      ensureSpecimenReuseTargetOrderIsEligible(
        makeOrder({ patient: null }),
        makeSpecimen(),
      ),
    ).toThrow(SPECIMEN_REUSE_ORDER_INELIGIBILITY_MESSAGE.OTHER_PATIENT);
  });
});

describe("ensureSpecimenReuseTargetItemsAreEligible", () => {
  it("accepts the eligible tests of the order", () => {
    const order = makeOrder();

    expect(() =>
      ensureSpecimenReuseTargetItemsAreEligible(order, specimenOfType, [
        TEST_IDS.itemId,
      ]),
    ).not.toThrow();
  });

  it("accepts several tests of the same order", () => {
    const order = makeOrder({
      items: [
        makeItem({ id: TEST_IDS.itemId }),
        makeItem({ id: TEST_IDS.otherItemId }),
      ],
    });

    expect(() =>
      ensureSpecimenReuseTargetItemsAreEligible(order, specimenOfType, [
        TEST_IDS.itemId,
        TEST_IDS.otherItemId,
      ]),
    ).not.toThrow();
  });

  // The tests of another order are not part of this one, even when both orders
  // belong to the same patient: an assignment is per order.
  it("refuses a test of another order", () => {
    expect(() =>
      ensureSpecimenReuseTargetItemsAreEligible(makeOrder(), specimenOfType, [
        TEST_IDS.otherItemId,
      ]),
    ).toThrow("Lab order item is not part of this lab order");
  });

  it.each([
    [
      makeItem({ status: LabOrderItemStatus.IN_PROCESS }),
      "NOT_ORDERED" as const,
    ],
    [makeItem({ specimens: [{ endedAt: null }] }), "ALREADY_ASSIGNED" as const],
    [
      makeItem({
        performable: {
          specimenTypes: [
            { specimenType: { id: TEST_IDS.otherSpecimenTypeId } },
          ],
        },
      }),
      "INCOMPATIBLE_SPECIMEN_TYPE" as const,
    ],
  ])(
    "refuses an ineligible test with its own message",
    (item, ineligibility) => {
      const order = makeOrder({ items: [item] });

      expect(() =>
        ensureSpecimenReuseTargetItemsAreEligible(order, specimenOfType, [
          item.id,
        ]),
      ).toThrow(SPECIMEN_REUSE_INELIGIBILITY_MESSAGE[ineligibility]);
    },
  );

  it("checks every requested test", () => {
    const order = makeOrder({
      items: [
        makeItem({ id: TEST_IDS.itemId }),
        makeItem({ id: TEST_IDS.otherItemId, specimens: [{ endedAt: null }] }),
      ],
    });

    expect(() =>
      ensureSpecimenReuseTargetItemsAreEligible(order, specimenOfType, [
        TEST_IDS.itemId,
        TEST_IDS.otherItemId,
      ]),
    ).toThrow("This test already has a specimen assigned");
  });
});
