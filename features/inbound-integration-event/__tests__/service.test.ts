import crypto from "crypto";
import stringify from "safe-stable-stringify";
import {
  InboundIntegrationEventStatus,
  IntegrationEventType,
} from "@/generated/prisma";
import { makeHisLabOrderPayload } from "@/test/factories/his-lab-order-payload.factory";
import {
  inboundIntegrationEventDetailSelect,
  inboundIntegrationEventListSelect,
} from "../inbound-integration-event.select";
import { CreateInboundIntegrationEventSchema } from "../inbound-integration-event.schema";
import {
  createInboundIntegrationEvent,
  getInboundIntegrationEvent,
  getInboundIntegrationEvents,
  updateInboundIntegrationEvent,
  validateInboundIntegrationEventIdentifiers,
} from "../inbound-integration-event.service";

/**
 * The inbound event is the audit trail of everything the HIS sends us: the
 * stored payload hash and identifiers are what makes a replay detectable, and
 * the list query is what an operator uses to find a failed delivery.
 */

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {},
}));

const TEST_IDS = {
  id: "tz4a98xxat96iws9zmbrgj3a",
  tokenId: "ckqp6y6q50000qzrm8b1v3f7d",
  labOrderId: "clx1a2b3c4d5e6f7g8h9i0jk",
  connectionId: "cm9z8y7x6w5v4u3t2s1r0qpo",
  laboratoryId: "c9wq3x1v70000qzrm5t2h8k4d",
} as const;

type EventClient = Parameters<typeof getInboundIntegrationEvent>[0];

function makeEventDatabase(methods: Record<string, jest.Mock>) {
  return { inboundIntegrationEvent: methods } as unknown as EventClient;
}

function makeCreateParams(
  overrides: Partial<Parameters<typeof createInboundIntegrationEvent>[1]> = {},
): Parameters<typeof createInboundIntegrationEvent>[1] {
  return {
    ...CreateInboundIntegrationEventSchema.parse({
      tokenId: TEST_IDS.tokenId,
      connectionId: TEST_IDS.connectionId,
      laboratoryId: TEST_IDS.laboratoryId,
      requestPayload: makeHisLabOrderPayload(),
    }),
    ...overrides,
  };
}

describe("createInboundIntegrationEvent", () => {
  it("stores the received payload with its hash and links the order", async () => {
    const row = { id: TEST_IDS.id };
    const create = jest.fn().mockResolvedValue(row);
    const db = makeEventDatabase({ create });
    const params = makeCreateParams({ labOrderId: TEST_IDS.labOrderId });

    await expect(createInboundIntegrationEvent(db, params)).resolves.toBe(row);

    const { data, select } = create.mock.calls[0][0] as {
      data: Record<string, unknown>;
      select: unknown;
    };

    expect(data).toEqual({
      token: { connect: { id: TEST_IDS.tokenId } },
      status: InboundIntegrationEventStatus.RECEIVED,
      labOrder: { connect: { id: TEST_IDS.labOrderId } },
      eventType: params.requestPayload.eventType,
      messageId: params.requestPayload.messageId,
      connection: { connect: { id: TEST_IDS.connectionId } },
      laboratory: { connect: { id: TEST_IDS.laboratoryId } },
      receivedAt: expect.any(Date),
      idempotencyKey: params.requestPayload.idempotencyKey,
      requestPayload: params.requestPayload,
      externalOrderId: params.requestPayload.order.id,
      // The hash is computed over a key-sorted serialisation, so a replay of
      // the same payload always hashes to the same value.
      requestPayloadHash: crypto
        .createHash("sha256")
        .update(stringify(params.requestPayload))
        .digest("hex"),
    });
    expect(select).toBe(inboundIntegrationEventDetailSelect);
  });

  it("leaves the order link open when the delivery did not create an order", async () => {
    const create = jest.fn().mockResolvedValue({ id: TEST_IDS.id });
    const db = makeEventDatabase({ create });

    await createInboundIntegrationEvent(db, makeCreateParams());

    const { data } = create.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };

    expect(data).toHaveProperty("labOrder");
    expect(data.labOrder).toBeUndefined();
  });

  it("propagates persistence failures so the caller's transaction can roll back", async () => {
    const error = new Error("duplicate idempotency key");
    const create = jest.fn().mockRejectedValueOnce(error);
    const db = makeEventDatabase({ create });

    await expect(
      createInboundIntegrationEvent(db, makeCreateParams()),
    ).rejects.toBe(error);
  });
});

describe("getInboundIntegrationEvents", () => {
  type ListParams = Parameters<typeof getInboundIntegrationEvents>[1];

  function listArgs(findMany: jest.Mock) {
    return findMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
      select: unknown;
      orderBy: unknown;
      skip?: number;
      take?: number;
    };
  }

  it("returns every event of the laboratory when no page is requested", async () => {
    const rows = [{ id: TEST_IDS.id }];
    const findMany = jest.fn().mockResolvedValue(rows);
    const count = jest.fn();
    const db = makeEventDatabase({ findMany, count });

    const [events, paginationMeta] = await getInboundIntegrationEvents(db, {
      laboratoryId: TEST_IDS.laboratoryId,
    } as ListParams);

    expect(events).toBe(rows);
    expect(paginationMeta).toBeNull();
    // A list used for a dashboard counter must not pay for a count query.
    expect(count).not.toHaveBeenCalled();
    expect(listArgs(findMany)).toEqual({
      where: { laboratoryId: TEST_IDS.laboratoryId },
      select: inboundIntegrationEventListSelect,
      orderBy: { createdAt: "desc" },
    });
  });

  it("combines every filter of an operator search into one query and page", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(41);
    const db = makeEventDatabase({ findMany, count });

    const [, paginationMeta] = await getInboundIntegrationEvents(db, {
      laboratoryId: TEST_IDS.laboratoryId,
      page: 2,
      pageSize: 20,
      search: "msg_abc",
      status: [InboundIntegrationEventStatus.FAILED],
      tokenId: TEST_IDS.tokenId,
      eventType: [IntegrationEventType.CLINICAL_ORDER_CREATED],
      connectionId: TEST_IDS.connectionId,
    } as ListParams);

    const args = listArgs(findMany);

    expect(args.where).toEqual({
      OR: [
        { messageId: { contains: "msg_abc", mode: "insensitive" } },
        { labOrderId: { contains: "msg_abc", mode: "insensitive" } },
        { idempotencyKey: { contains: "msg_abc", mode: "insensitive" } },
        { externalOrderId: { contains: "msg_abc", mode: "insensitive" } },
      ],
      status: { in: [InboundIntegrationEventStatus.FAILED] },
      tokenId: TEST_IDS.tokenId,
      eventType: { in: [IntegrationEventType.CLINICAL_ORDER_CREATED] },
      connectionId: TEST_IDS.connectionId,
      laboratoryId: TEST_IDS.laboratoryId,
    });
    // Page 2 of 20 starts at the 21st row.
    expect(args.skip).toBe(20);
    expect(args.take).toBe(20);
    expect(count).toHaveBeenCalledWith({ where: args.where });
    expect(paginationMeta).toMatchObject({
      page: 2,
      pageSize: 20,
      total: 41,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("pages from the first page when only the page size is requested", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(3);
    const db = makeEventDatabase({ findMany, count });

    const [, paginationMeta] = await getInboundIntegrationEvents(db, {
      laboratoryId: TEST_IDS.laboratoryId,
      pageSize: 10,
    } as ListParams);

    expect(listArgs(findMany).skip).toBe(0);
    expect(paginationMeta).toMatchObject({
      page: 1,
      pageSize: 10,
      total: 3,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});

describe("getInboundIntegrationEvent", () => {
  it("scopes the lookup to the caller's laboratory", async () => {
    const row = { id: TEST_IDS.id };
    const findFirst = jest.fn().mockResolvedValue(row);
    const db = makeEventDatabase({ findFirst });

    await expect(
      getInboundIntegrationEvent(db, {
        id: TEST_IDS.id,
        laboratoryId: TEST_IDS.laboratoryId,
      }),
    ).resolves.toBe(row);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: TEST_IDS.id, laboratoryId: TEST_IDS.laboratoryId },
      select: inboundIntegrationEventDetailSelect,
    });
  });
});

describe("validateInboundIntegrationEventIdentifiers", () => {
  it("matches a delivery on either identifier and returns the existing event", async () => {
    const existing = { id: TEST_IDS.id };
    const findMany = jest.fn().mockResolvedValue([existing, { id: "other" }]);
    const db = makeEventDatabase({ findMany });

    await expect(
      validateInboundIntegrationEventIdentifiers(db, {
        laboratoryId: TEST_IDS.laboratoryId,
        connectionId: TEST_IDS.connectionId,
        messageId: "msg_abc",
        idempotencyKey: "idem_abc",
      }),
    ).resolves.toBe(existing);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        connectionId: TEST_IDS.connectionId,
        laboratoryId: TEST_IDS.laboratoryId,
        OR: [{ messageId: "msg_abc" }, { idempotencyKey: "idem_abc" }],
      },
      select: inboundIntegrationEventDetailSelect,
    });
  });

  it("only matches on the identifier that is supplied", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const db = makeEventDatabase({ findMany });

    await validateInboundIntegrationEventIdentifiers(db, {
      laboratoryId: TEST_IDS.laboratoryId,
      connectionId: TEST_IDS.connectionId,
      idempotencyKey: "idem_abc",
    });

    expect(findMany.mock.calls[0][0].where.OR).toEqual([
      { idempotencyKey: "idem_abc" },
    ]);
  });

  it("returns null when the delivery has not been processed before", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const db = makeEventDatabase({ findMany });

    await expect(
      validateInboundIntegrationEventIdentifiers(db, {
        laboratoryId: TEST_IDS.laboratoryId,
        connectionId: TEST_IDS.connectionId,
        messageId: "msg_abc",
      }),
    ).resolves.toBeNull();
  });
});

describe("updateInboundIntegrationEvent", () => {
  type UpdateParams = Parameters<typeof updateInboundIntegrationEvent>[1];

  // The schema types the summary as an empty object, so the shape the callers
  // actually store (a count of what was imported) needs a cast at this boundary.
  const resultSummary = {
    data: { created: 1, updated: 0 },
  } as unknown as UpdateParams["resultSummary"];

  const responsePayload = {
    data: { labOrderId: TEST_IDS.labOrderId, labOrderNo: "ORD-1" },
    success: true,
    messageId: "msg_abc",
    idempotencyKey: "idem_abc",
  };

  it("links the created order and stores the processing outcome", async () => {
    const row = { id: TEST_IDS.id };
    const update = jest.fn().mockResolvedValue(row);
    const db = makeEventDatabase({ update });
    const processedAt = new Date("2026-10-27T11:00:00.000Z");

    await expect(
      updateInboundIntegrationEvent(db, {
        id: TEST_IDS.id,
        status: InboundIntegrationEventStatus.PROCESSED,
        labOrderId: TEST_IDS.labOrderId,
        processedAt,
        resultSummary,
        responsePayload,
      } as UpdateParams),
    ).resolves.toBe(row);

    const { where, data, select } = update.mock.calls[0][0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
      select: unknown;
    };

    expect(where).toEqual({ id: TEST_IDS.id });
    expect(data).toEqual({
      status: InboundIntegrationEventStatus.PROCESSED,
      labOrder: { connect: { id: TEST_IDS.labOrderId } },
      errorCode: undefined,
      eventType: undefined,
      messageId: undefined,
      processedAt,
      errorMessage: undefined,
      resultSummary,
      responsePayload,
    });
    expect(select).toBe(inboundIntegrationEventDetailSelect);
  });

  it("records a failed delivery without touching the order link", async () => {
    const update = jest.fn().mockResolvedValue({ id: TEST_IDS.id });
    const db = makeEventDatabase({ update });

    await updateInboundIntegrationEvent(db, {
      id: TEST_IDS.id,
      status: InboundIntegrationEventStatus.FAILED,
      errorCode: "PATIENT_NOT_FOUND",
      errorMessage: "No patient matches the identifier",
    } as UpdateParams);

    const { data } = update.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };

    expect(data.errorCode).toBe("PATIENT_NOT_FOUND");
    expect(data.errorMessage).toBe("No patient matches the identifier");
    // `undefined` keeps the existing link, which is the point: a failed retry
    // must not detach the order a previous successful attempt created.
    expect(data).toHaveProperty("labOrder");
    expect(data.labOrder).toBeUndefined();
  });
});
