import { ensureLabOrderItemHasNoActiveSpecimen } from "../lab-order-item.policy";

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
