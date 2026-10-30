/**
 * @jest-environment node
 */

import prisma from "@/lib/prisma";
import {
  HIS_LAB_ORDER_TEST_IDS,
  makeHisLabOrderItem,
  makeHisLabOrderPayload,
} from "@/test/factories/his-lab-order-payload.factory";
import { makeIntegrationTokenRecord } from "@/test/factories/integration-token.factory";
import { POST } from "../route";

// Every case builds a laboratory, a connection, a token and an orderable, then
// drives one or two full ingestions. Against the remote database this suite is
// an order of magnitude slower than the unit suites, so it gets its own budget.
jest.setTimeout(120_000);

const createdLaboratoryIds: string[] = [];

type Fixture = {
  laboratoryId: string;
  connectionId: string;
  plaintext: string;
  orderableId: string;
  performableId: string;
};

/**
 * Creates everything an inbound HIS delivery depends on: a laboratory, an
 * active connection, a bearer token whose plaintext this test owns, and the
 * external orderable mapped to a LIS performable.
 */
async function createFixture(): Promise<Fixture> {
  const laboratory = await prisma.laboratory.create({ data: {} });
  createdLaboratoryIds.push(laboratory.id);

  const connection = await prisma.integrationConnection.create({
    data: {
      laboratoryId: laboratory.id,
      name: "HIS",
      type: "BEARER_TOKEN",
      sourceSystem: "HIS",
    },
  });

  const { plaintext, data } = makeIntegrationTokenRecord({
    connectionId: connection.id,
    laboratoryId: laboratory.id,
  });
  await prisma.integrationToken.create({ data });

  const orderable = await prisma.externalLabOrderable.create({
    data: {
      connectionId: connection.id,
      laboratoryId: laboratory.id,
      sourceSystem: "HIS",
      externalCode: "CBC",
      externalDisplay: "Complete Blood Count",
      externalCodeSystem: "HIS",
      externalOrderableId: HIS_LAB_ORDER_TEST_IDS.orderableExternalId,
    },
  });

  const performable = await prisma.lisPerformable.create({
    data: {
      laboratoryId: laboratory.id,
      externalOrderableId: orderable.id,
      displayName: "Complete Blood Count",
    },
  });

  return {
    laboratoryId: laboratory.id,
    connectionId: connection.id,
    plaintext,
    orderableId: orderable.id,
    performableId: performable.id,
  };
}

function post(body: unknown, token?: string) {
  return POST(
    new Request("http://localhost/api/integration/his/lab-order", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }),
  );
}

function orderEvents(fixture: Fixture) {
  return prisma.inboundIntegrationEvent.findMany({
    where: { laboratoryId: fixture.laboratoryId },
    orderBy: { createdAt: "asc" },
  });
}

afterEach(async () => {
  const laboratoryIds = [...createdLaboratoryIds];

  // Child rows first: the route writes events, orders, items and patients.
  await prisma.inboundIntegrationEvent.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.labOrderItem.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.labOrder.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.patient.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.lisPerformable.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.externalLabOrderable.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.integrationToken.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.integrationConnection.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.laboratory.deleteMany({ where: { id: { in: laboratoryIds } } });

  createdLaboratoryIds.length = 0;
});

describe("POST /api/integration/his/lab-order — authentication", () => {
  it("rejects a delivery without a bearer token", async () => {
    const fixture = await createFixture();

    const response = await post(makeHisLabOrderPayload());

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-cache");
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing integration token.",
      },
    });
    // Nothing reached the event log.
    await expect(orderEvents(fixture)).resolves.toHaveLength(0);
  });

  it("rejects a token that does not resolve to a live integration token", async () => {
    const fixture = await createFixture();

    const response = await post(makeHisLabOrderPayload(), "moncip_his_unknown");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid integration token.",
      },
    });
    await expect(orderEvents(fixture)).resolves.toHaveLength(0);
  });

  it("rejects a revoked token", async () => {
    const fixture = await createFixture();
    await prisma.integrationToken.updateMany({
      where: { laboratoryId: fixture.laboratoryId },
      data: { revokedAt: new Date() },
    });

    const response = await post(makeHisLabOrderPayload(), fixture.plaintext);

    expect(response.status).toBe(401);
    await expect(orderEvents(fixture)).resolves.toHaveLength(0);
  });

  it("rejects a token whose connection was deactivated", async () => {
    const fixture = await createFixture();
    await prisma.integrationConnection.update({
      where: { id: fixture.connectionId },
      data: { isActive: false },
    });

    const response = await post(makeHisLabOrderPayload(), fixture.plaintext);

    expect(response.status).toBe(401);
    await expect(orderEvents(fixture)).resolves.toHaveLength(0);
  });
});

describe("POST /api/integration/his/lab-order — ingest", () => {
  it("creates the order, the items and the event", async () => {
    const fixture = await createFixture();
    const payload = makeHisLabOrderPayload();

    const response = await post(payload, fixture.plaintext);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      messageId: payload.messageId,
      idempotencyKey: payload.idempotencyKey,
    });
    // Numbers are reserved per day, so only the shape is predictable here.
    expect(body.data.labOrderNo).toMatch(/^ORD-\d{8}-\d{4}$/);

    const order = await prisma.labOrder.findUniqueOrThrow({
      where: { id: body.data.labOrderId },
      include: { items: true, patient: true },
    });

    expect(order).toMatchObject({
      no: body.data.labOrderNo,
      externalId: payload.order.id,
      externalNo: payload.order.no,
      sourceSystem: "HIS",
      laboratoryId: fixture.laboratoryId,
      externalPatientId: payload.patient.id,
      externalEncounterId: payload.encounter.id,
      externalOrderingProviderId: payload.orderingProvider.id,
      status: "ORDERED",
    });
    expect(order.patient?.name).toBe(payload.patient.name);
    expect(order.items).toHaveLength(1);
    expect(order.items[0]).toMatchObject({
      performableId: fixture.performableId,
      externalOrderableId: fixture.orderableId,
      externalOrderItemId: payload.items[0].id,
      laboratoryId: fixture.laboratoryId,
    });

    const events = await orderEvents(fixture);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      status: "PROCESSED",
      labOrderId: order.id,
      messageId: payload.messageId,
      idempotencyKey: payload.idempotencyKey,
      externalOrderId: payload.order.id,
      connectionId: fixture.connectionId,
      tokenId: expect.any(String),
    });
    expect(events[0].responsePayload).toMatchObject({
      success: true,
      data: { labOrderId: order.id, labOrderNo: order.no },
    });

    /**
     * TODO(his-route): the route passes `proccessedAt` to the update schema,
     * which knows only `processedAt`, so Zod strips the typo and the success
     * timestamp is never written. The assertion pins today's behaviour so the
     * fix (rename the key) shows up as a deliberate change.
     */
    expect(events[0].processedAt).toBeNull();
  });

  it("answers a replayed delivery without creating a second order", async () => {
    const fixture = await createFixture();
    const payload = makeHisLabOrderPayload();

    const first = await post(payload, fixture.plaintext);
    const firstBody = await first.json();
    const second = await post(payload, fixture.plaintext);
    const secondBody = await second.json();

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(secondBody).toEqual(firstBody);

    await expect(
      prisma.labOrder.count({ where: { laboratoryId: fixture.laboratoryId } }),
    ).resolves.toBe(1);
    await expect(
      prisma.labOrderItem.count({
        where: { laboratoryId: fixture.laboratoryId },
      }),
    ).resolves.toBe(1);
    await expect(orderEvents(fixture)).resolves.toHaveLength(1);
  });

  it("treats a new message id with a known idempotency key as the same delivery", async () => {
    const fixture = await createFixture();
    const payload = makeHisLabOrderPayload();
    const firstBody = await (await post(payload, fixture.plaintext)).json();

    const replay = makeHisLabOrderPayload({
      idempotencyKey: payload.idempotencyKey,
    });
    const response = await post(replay, fixture.plaintext);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(firstBody.data);
    // The reply echoes the message id the HIS just sent, even though the order
    // that comes back is the one recorded under the original delivery.
    expect(body.messageId).toBe(replay.messageId);
    await expect(orderEvents(fixture)).resolves.toHaveLength(1);
    await expect(
      prisma.labOrder.count({ where: { laboratoryId: fixture.laboratoryId } }),
    ).resolves.toBe(1);
  });
});

describe("POST /api/integration/his/lab-order — order lifecycle", () => {
  it("replaces the items of an order that is still ORDERED", async () => {
    const fixture = await createFixture();
    const payload = makeHisLabOrderPayload();
    const firstBody = await (await post(payload, fixture.plaintext)).json();
    const before = await prisma.labOrderItem.findMany({
      where: { laboratoryId: fixture.laboratoryId },
    });

    const amended = makeHisLabOrderPayload({
      items: [
        makeHisLabOrderItem({ id: "ITEM-5001", sortOrder: 0 }),
        makeHisLabOrderItem({ id: "ITEM-5002", sortOrder: 1 }),
      ],
    });
    const response = await post(amended, fixture.plaintext);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.labOrderId).toBe(firstBody.data.labOrderId);

    const after = await prisma.labOrderItem.findMany({
      where: { laboratoryId: fixture.laboratoryId },
    });

    expect(after.map((item) => item.externalOrderItemId).sort()).toEqual([
      "ITEM-5001",
      "ITEM-5002",
    ]);
    // The update deletes and recreates the items instead of diffing them.
    expect(after.map((item) => item.id)).not.toContain(before[0].id);
    await expect(
      prisma.labOrder.count({ where: { laboratoryId: fixture.laboratoryId } }),
    ).resolves.toBe(1);
    await expect(orderEvents(fixture)).resolves.toHaveLength(2);
  });

  it("acknowledges a repeated cancellation", async () => {
    const fixture = await createFixture();
    const firstBody = await (
      await post(makeHisLabOrderPayload(), fixture.plaintext)
    ).json();
    await prisma.labOrder.update({
      where: { id: firstBody.data.labOrderId },
      data: { status: "CANCELLED" },
    });

    const response = await post(
      makeHisLabOrderPayload({ order: { status: "CANCELLED" } }),
      fixture.plaintext,
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.labOrderId).toBe(firstBody.data.labOrderId);
    expect(body.data.labOrderNo).toBe(firstBody.data.labOrderNo);
  });

  it("refuses a cancellation once the laboratory has started the order", async () => {
    const fixture = await createFixture();
    const firstBody = await (
      await post(makeHisLabOrderPayload(), fixture.plaintext)
    ).json();
    await prisma.labOrder.update({
      where: { id: firstBody.data.labOrderId },
      data: { status: "COMPLETED" },
    });

    const response = await post(
      makeHisLabOrderPayload({ order: { status: "CANCELLED" } }),
      fixture.plaintext,
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toEqual({
      code: "LAB_ORDER_UNCANCELLABLE",
      message: `Lab order '${HIS_LAB_ORDER_TEST_IDS.orderExternalId}' is not cancellable by non-laboratory users.`,
    });

    const events = await orderEvents(fixture);

    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({
      status: "FAILED",
      // The failure is reported to the HIS but not linked to the order.
      labOrderId: null,
      responsePayload: { error: { code: "LAB_ORDER_UNCANCELLABLE" } },
    });

    // The order itself is untouched.
    const order = await prisma.labOrder.findUniqueOrThrow({
      where: { id: firstBody.data.labOrderId },
    });

    expect(order.status).toBe("COMPLETED");
  });
});

describe("POST /api/integration/his/lab-order — failures", () => {
  it("records a failed event when an orderable is not registered", async () => {
    const fixture = await createFixture();
    const payload = makeHisLabOrderPayload({
      items: [makeHisLabOrderItem({ orderableId: "EXT-UNKNOWN" })],
    });

    const response = await post(payload, fixture.plaintext);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toEqual({
      code: "ORDERABLE_NOT_REGISTERED",
      message: "Orderable 'EXT-UNKNOWN' is not registered.",
    });

    // The transaction rolled back, so no order or patient survives.
    await expect(
      prisma.labOrder.count({ where: { laboratoryId: fixture.laboratoryId } }),
    ).resolves.toBe(0);
    await expect(
      prisma.patient.count({ where: { laboratoryId: fixture.laboratoryId } }),
    ).resolves.toBe(0);

    const events = await orderEvents(fixture);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      status: "FAILED",
      labOrderId: null,
      responsePayload: { error: { code: "ORDERABLE_NOT_REGISTERED" } },
    });
  });

  it("records a failed event when the order items are rejected", async () => {
    const fixture = await createFixture();
    // The event is recorded before the order is built, so an item list the order
    // schema rejects (duplicate sort orders) must still leave a FAILED row.
    const payload = makeHisLabOrderPayload({
      items: [
        makeHisLabOrderItem({ id: "ITEM-5001", sortOrder: 0 }),
        makeHisLabOrderItem({ id: "ITEM-5002", sortOrder: 0 }),
      ],
    });

    const response = await post(payload, fixture.plaintext);

    // A schema violation is not an `APIError`, so it surfaces as a 500.
    expect(response.status).toBe(500);

    const events = await orderEvents(fixture);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      status: "FAILED",
      responsePayload: { error: { code: "UNKNOWN_ERROR" } },
    });
    await expect(
      prisma.labOrder.count({ where: { laboratoryId: fixture.laboratoryId } }),
    ).resolves.toBe(0);
  });

  it("rejects an unusable payload before it is recorded", async () => {
    const fixture = await createFixture();
    const payload = makeHisLabOrderPayload();
    // `sex` is required by the patient snapshot schema.
    delete (payload.patient as { sex?: string }).sex;

    const response = await post(payload, fixture.plaintext);

    expect(response.status).toBe(500);
    // The delivery never became an event, so there is nothing to mark FAILED.
    await expect(orderEvents(fixture)).resolves.toHaveLength(0);
  });

  it("answers 500 without an event when the body is not JSON", async () => {
    const fixture = await createFixture();

    const response = await POST(
      new Request("http://localhost/api/integration/his/lab-order", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${fixture.plaintext}`,
        },
        body: "{ not json",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe("UNKNOWN_ERROR");
    // The event is created after the body is read, so there is nothing to fail.
    await expect(orderEvents(fixture)).resolves.toHaveLength(0);
  });
});
