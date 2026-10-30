import {
  UpdateInboundIntegrationEventSchema,
  ValidateInboundIntegrationEventIdentifiersSchema,
} from "../inbound-integration-event.schema";

/**
 * A repeated delivery is recognised by the identifiers the HIS sends with it.
 * The rule that at least one of them is present is the line between
 * "already processed, ignore" and "processing a brand new order twice".
 */

const TEST_IDS = {
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
  connectionId: "cx1a2b3c4d5e6f7g8h9i0jk",
} as const;

describe("ValidateInboundIntegrationEventIdentifiersSchema", () => {
  it.each([
    ["a message id", { messageId: "msg_abc" }],
    ["an idempotency key", { idempotencyKey: "idem_abc" }],
    ["both identifiers", { messageId: "msg_abc", idempotencyKey: "idem_abc" }],
  ])("accepts a delivery that carries %s", (_label, identifiers) => {
    const result = ValidateInboundIntegrationEventIdentifiersSchema.safeParse({
      ...identifiers,
      laboratoryId: TEST_IDS.laboratoryId,
      connectionId: TEST_IDS.connectionId,
    });

    expect(result.success).toBe(true);
  });

  it("refuses a delivery that carries no identifier to match on", () => {
    const result = ValidateInboundIntegrationEventIdentifiersSchema.safeParse({
      laboratoryId: TEST_IDS.laboratoryId,
      connectionId: TEST_IDS.connectionId,
    });

    expect(result.success).toBe(false);
  });

  it("trims the identifiers the caller supplied", () => {
    expect(
      ValidateInboundIntegrationEventIdentifiersSchema.parse({
        messageId: "  msg_abc  ",
        laboratoryId: TEST_IDS.laboratoryId,
        connectionId: TEST_IDS.connectionId,
      }).messageId,
    ).toBe("msg_abc");
  });
});

describe("UpdateInboundIntegrationEventSchema", () => {
  it("accepts the smallest update, because every field is optional", () => {
    const parsed = UpdateInboundIntegrationEventSchema.parse({
      id: "ce4x5c6v7b8n9m0q1w2e3r4t",
    });

    expect(parsed).toEqual({ id: "ce4x5c6v7b8n9m0q1w2e3r4t" });
  });
});
