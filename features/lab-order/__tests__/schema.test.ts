import {
  CreateLabOrderSchema,
  GetLabOrderActionSchema,
  GetLabOrderSchema,
  UpdateLabOrderSchema,
} from "../lab-order.schema";

/**
 * The snapshot schema an order is stored from carries two rules that no other
 * test exercises: the sort order is unique per item and a lookup must identify
 * the order either by an id or by the source system plus its external number.
 */

const TEST_IDS = {
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
  patientId: "cp4x5c6v7b8n9m0q1w2e3r4t",
  performableId: "pz4a98xxat96iws9zmbrgj3a",
  externalLabOrderableId: "oz4a98xxat96iws9zmbrgj3a",
} as const;

function orderItem(sortOrder: number) {
  return {
    sortOrder,
    performableId: TEST_IDS.performableId,
    externalOrderItemId: `ITEM-${sortOrder}`,
    externalLabOrderableId: TEST_IDS.externalLabOrderableId,
  };
}

function orderPayload(overrides: Record<string, unknown> = {}) {
  return {
    no: "ORD-1",
    period: "2601",
    sequence: 5,
    patientId: TEST_IDS.patientId,
    laboratoryId: TEST_IDS.laboratoryId,
    externalId: "ORD-1",
    externalNo: "ORD-1",
    externalPatientId: "PAT-1",
    externalEncounterId: "ENC-1",
    externalOrderingProviderId: "DOC-1",
    sourceSystem: "HIS",
    orderedAt: "2026-01-05T08:00:00.000Z",
    items: [orderItem(0)],
    ...overrides,
  };
}

describe("CreateLabOrderSchema", () => {
  it("accepts an order whose items each carry their own sort order", () => {
    const parsed = CreateLabOrderSchema.parse(
      orderPayload({ items: [orderItem(0), orderItem(1)] }),
    );

    expect(parsed.items.map((item) => item.sortOrder)).toEqual([0, 1]);
    // The status is assigned by the server, so the caller cannot supply one.
    expect(parsed).not.toHaveProperty("status");
  });

  it("refuses two items on the same sort order", () => {
    const result = CreateLabOrderSchema.safeParse(
      orderPayload({ items: [orderItem(0), orderItem(0)] }),
    );

    expect(result.success).toBe(false);
  });

  it("coerces the sort order of an item that arrives as a string", () => {
    const parsed = CreateLabOrderSchema.parse(
      orderPayload({
        items: [{ ...orderItem(0), sortOrder: "3" }],
      }),
    );

    expect(parsed.items[0].sortOrder).toBe(3);
  });
});

describe("UpdateLabOrderSchema", () => {
  it("accepts an update that renumbers the items without repeating a number", () => {
    const parsed = UpdateLabOrderSchema.parse(
      orderPayload({ items: [orderItem(4), orderItem(5)] }),
    );

    expect(parsed.items.map((item) => item.sortOrder)).toEqual([4, 5]);
  });

  it("refuses an update that puts two items on the same sort order", () => {
    expect(
      UpdateLabOrderSchema.safeParse(
        orderPayload({ items: [orderItem(2), orderItem(2)] }),
      ).success,
    ).toBe(false);
  });
});

describe("GetLabOrderActionSchema", () => {
  it.each([
    ["an id", { id: "cm9z8y7x6w5v4u3t2s1r0qpo" }],
    ["a laboratory number", { no: "ORD-1" }],
    [
      "a source system and an external id",
      { sourceSystem: "HIS", externalId: "ORD-1" },
    ],
    [
      "a source system and an external number",
      { sourceSystem: "HIS", externalNo: "ORD-1" },
    ],
  ])("accepts a lookup by %s", (_label, params) => {
    expect(GetLabOrderActionSchema.safeParse(params).success).toBe(true);
    expect(
      GetLabOrderSchema.safeParse({
        ...params,
        laboratoryId: TEST_IDS.laboratoryId,
      }).success,
    ).toBe(true);
  });

  it.each([
    ["nothing", {}],
    // An external identifier is meaningless without the system it came from.
    ["an external id alone", { externalId: "ORD-1" }],
    ["an external number alone", { externalNo: "ORD-1" }],
  ])("refuses a lookup by %s", (_label, params) => {
    expect(GetLabOrderActionSchema.safeParse(params).success).toBe(false);
  });
});
