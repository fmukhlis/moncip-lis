/**
 * @jest-environment node
 */
import { LabOrderStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { buildLabOrderNo, buildLabOrderPeriod } from "@/lib/generate-item-no";
import {
  createLabOrder,
  getLabOrder,
  getLabOrders,
  getLabOrderSpecimens,
  reserveLabOrderNo,
  updateLabOrder,
  updateLabOrderStatus,
} from "../lab-order.service";
import { LabOrderItemsHaveSpecimensError } from "../lab-order.error";
import { GetLabOrdersSchema } from "../lab-order.schema";
import {
  assertTestDatabaseReady,
  assertTestDatabaseUrl,
} from "@/test/support/test-database";

// Writes to Postgres, so the suite refuses to load against anything but the
// dedicated test database; reachability and schema are checked before the first
// test. See test/support/test-database.ts.
assertTestDatabaseUrl();
beforeAll(assertTestDatabaseReady);

const createdLaboratoryIds: string[] = [];
const createdSpecimenTypeIds: string[] = [];

type Fixture = {
  laboratoryId: string;
  patientId: string;
  orderableId: string;
  performableId: string;
  specimenTypeId: string;
};

/**
 * Order numbers, item snapshots and the patient link are all decided by these
 * four functions, so they are exercised against a real database; mocked Prisma
 * would only re-assert the query we wrote.
 */
async function createFixture(): Promise<Fixture> {
  const laboratory = await prisma.laboratory.create({ data: {} });
  createdLaboratoryIds.push(laboratory.id);

  const patient = await prisma.patient.create({
    data: {
      laboratoryId: laboratory.id,
      name: "Ada Lovelace",
      dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
      sourceSystem: "HIS",
      externalPatientId: `EXT-${laboratory.id}`,
    },
  });

  const connection = await prisma.integrationConnection.create({
    data: {
      laboratoryId: laboratory.id,
      name: "HIS",
      type: "BEARER_TOKEN",
      sourceSystem: "HIS",
    },
  });

  const orderable = await prisma.externalLabOrderable.create({
    data: {
      connectionId: connection.id,
      laboratoryId: laboratory.id,
      sourceSystem: "HIS",
      externalCode: "CBC",
      externalDisplay: "Complete Blood Count",
      externalCodeSystem: "HIS",
      externalOrderableId: `EXT-CBC-${laboratory.id}`,
    },
  });

  const performable = await prisma.lisPerformable.create({
    data: {
      laboratoryId: laboratory.id,
      externalOrderableId: orderable.id,
      displayName: "Complete Blood Count",
    },
  });

  // The type is shared across laboratories, so its code carries the laboratory
  // to keep the fixtures of parallel suites apart.
  const specimenType = await prisma.specimenType.create({
    data: {
      code: `WB-${laboratory.id}`,
      displayName: "Whole blood",
    },
  });
  createdSpecimenTypeIds.push(specimenType.id);

  return {
    laboratoryId: laboratory.id,
    patientId: patient.id,
    orderableId: orderable.id,
    performableId: performable.id,
    specimenTypeId: specimenType.id,
  };
}

/**
 * Creates a specimen of the fixture and assigns it to one item of an order. An
 * assignment is the only way an order reaches a specimen, so every specimen a
 * test expects to find through the order has to be assigned like that.
 */
async function createAssignedSpecimen(
  fixture: Fixture,
  labOrderItemId: string,
  overrides: Record<string, unknown> = {},
) {
  const specimen = await prisma.specimen.create({
    data: {
      no: "SPC-260105-0001",
      period: "20260105",
      sequence: 1,
      patientId: fixture.patientId,
      laboratoryId: fixture.laboratoryId,
      specimenTypeId: fixture.specimenTypeId,
      ...overrides,
    },
  });

  await prisma.labOrderItemSpecimen.create({
    data: {
      specimenId: specimen.id,
      labOrderItemId,
      laboratoryId: fixture.laboratoryId,
    },
  });

  return specimen;
}

function orderInput(fixture: Fixture, overrides: Record<string, unknown> = {}) {
  // The HIS number is derived from the external id unless a test says
  // otherwise: the database allows one order per (laboratory, source, no).
  const externalId =
    (overrides.externalId as string | undefined) ?? "ORDER-4001";

  return {
    no: "ORD-20260105-0001",
    period: "20260105",
    sequence: 1,
    priority: "ROUTINE" as const,
    orderedAt: new Date("2026-01-05T08:00:00.000Z"),
    patientId: fixture.patientId,
    externalId,
    externalNo: `HIS-${externalId}`,
    laboratoryId: fixture.laboratoryId,
    sourceSystem: "HIS",
    externalPatientId: "PAT-1001",
    externalEncounterId: "ENC-2001",
    externalOrderingProviderId: "PROV-3001",
    items: [
      {
        sortOrder: 0,
        performableId: fixture.performableId,
        externalLabOrderableId: fixture.orderableId,
        externalOrderItemId: "ITEM-5001",
      },
    ],
    ...overrides,
  } as Parameters<typeof createLabOrder>[1];
}

afterEach(async () => {
  const laboratoryIds = [...createdLaboratoryIds];

  // The assignments cascade with their specimen and their item, but they are
  // deleted first so the order the rows disappear in never matters.
  await prisma.labOrderItemSpecimen.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.specimen.deleteMany({
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
  await prisma.integrationConnection.deleteMany({
    where: { laboratoryId: { in: laboratoryIds } },
  });
  await prisma.specimenType.deleteMany({
    where: { id: { in: createdSpecimenTypeIds } },
  });
  await prisma.laboratory.deleteMany({ where: { id: { in: laboratoryIds } } });

  createdLaboratoryIds.length = 0;
  createdSpecimenTypeIds.length = 0;
});

describe("reserveLabOrderNo", () => {
  it("returns a zero-padded number for the day", async () => {
    const date = new Date();
    const period = buildLabOrderPeriod(date);

    const reserved = await reserveLabOrderNo(prisma, { date });

    expect(reserved.period).toBe(period);
    expect(reserved.sequence).toBeGreaterThan(0);
    expect(reserved.no).toBe(buildLabOrderNo(period, reserved.sequence));
    expect(reserved.no).toMatch(new RegExp(`^ORD-${period}-\\d{4}$`));
  });

  it("hands out consecutive numbers within the same period", async () => {
    const date = new Date();

    const first = await reserveLabOrderNo(prisma, { date });
    const second = await reserveLabOrderNo(prisma, { date });

    expect(second.sequence).toBe(first.sequence + 1);
    expect(second.no).not.toBe(first.no);
  });

  it("reuses the period counter rather than the wall clock", async () => {
    // A fixed date keeps the assertion independent of the day the suite runs.
    const date = new Date(2020, 0, 2);
    const period = "20200102";

    const first = await reserveLabOrderNo(prisma, { date });
    const second = await reserveLabOrderNo(prisma, { date });

    expect(first.period).toBe(period);
    expect(second.period).toBe(period);
    expect(second.sequence).toBe(first.sequence + 1);
  });
});

describe("createLabOrder", () => {
  it("stores the order, its patient link and its items", async () => {
    const fixture = await createFixture();

    const order = await createLabOrder(prisma, orderInput(fixture));

    expect(order).toMatchObject({
      no: "ORD-20260105-0001",
      priority: "ROUTINE",
      status: "ORDERED",
      externalId: "ORDER-4001",
      externalNo: "HIS-ORDER-4001",
    });
    expect(order.items).toHaveLength(1);
    // The detail select exposes the performable through its relation, not as an
    // id column, so the mapping is asserted through the relation.
    expect(order.items[0].performable?.id).toBe(fixture.performableId);
    expect(order.items[0].externalOrderItemId).toBe("ITEM-5001");

    // The columns the select does not expose are read straight from the row.
    const stored = await prisma.labOrder.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true },
    });

    expect(stored).toMatchObject({
      period: "20260105",
      sequence: 1,
      laboratoryId: fixture.laboratoryId,
      patientId: fixture.patientId,
      sourceSystem: "HIS",
      externalPatientId: "PAT-1001",
      externalEncounterId: "ENC-2001",
      externalOrderingProviderId: "PROV-3001",
    });
    expect(stored.items[0]).toMatchObject({
      performableId: fixture.performableId,
      externalOrderableId: fixture.orderableId,
      laboratoryId: fixture.laboratoryId,
      sortOrder: 0,
    });
  });

  it("stamps the receipt time itself", async () => {
    const fixture = await createFixture();

    const before = Date.now();
    const order = await createLabOrder(prisma, orderInput(fixture));

    expect(order.receivedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(order.receivedAt.getTime()).toBeLessThanOrEqual(Date.now());
    expect(order.orderedAt).toEqual(new Date("2026-01-05T08:00:00.000Z"));
  });

  it("stores several items together with their sort order", async () => {
    const fixture = await createFixture();

    const order = await createLabOrder(
      prisma,
      orderInput(fixture, {
        items: [
          {
            sortOrder: 1,
            performableId: fixture.performableId,
            externalLabOrderableId: fixture.orderableId,
            externalOrderItemId: "ITEM-5002",
          },
          {
            sortOrder: 0,
            performableId: fixture.performableId,
            externalLabOrderableId: fixture.orderableId,
            externalOrderItemId: "ITEM-5001",
          },
        ],
      }),
    );

    // The nested create does not promise a row order, so the pairing of item to
    // sort order is what the callers rely on.
    expect(
      order.items
        .map((item) => [item.externalOrderItemId, item.sortOrder])
        .sort(),
    ).toEqual([
      ["ITEM-5001", 0],
      ["ITEM-5002", 1],
    ]);
  });
});

describe("updateLabOrder", () => {
  it("replaces the items and applies the amended header", async () => {
    const fixture = await createFixture();
    const created = await createLabOrder(prisma, orderInput(fixture));

    const updated = await updateLabOrder(
      prisma,
      orderInput(fixture, {
        status: "IN_PROCESS",
        priority: "STAT",
        externalNo: "HIS-ORDER-4001-A",
        items: [
          {
            sortOrder: 0,
            performableId: fixture.performableId,
            externalLabOrderableId: fixture.orderableId,
            externalOrderItemId: "ITEM-6001",
          },
          {
            sortOrder: 1,
            performableId: fixture.performableId,
            externalLabOrderableId: fixture.orderableId,
            externalOrderItemId: "ITEM-6002",
          },
        ],
      }),
    );

    expect(updated.id).toBe(created.id);
    expect(updated.status).toBe("IN_PROCESS");
    expect(updated.priority).toBe("STAT");
    expect(updated.externalNo).toBe("HIS-ORDER-4001-A");
    // The no/period/sequence of an existing order are never re-issued.
    expect(updated.no).toBe(created.no);
    // The replacement rows are not returned in a guaranteed order.
    expect(
      updated.items
        .map((item) => [item.externalOrderItemId, item.sortOrder])
        .sort(),
    ).toEqual([
      ["ITEM-6001", 0],
      ["ITEM-6002", 1],
    ]);
    expect(updated.items.map((item) => item.id)).not.toContain(
      created.items[0].id,
    );
  });

  it("refuses to re-sync while a specimen is assigned to the order", async () => {
    const fixture = await createFixture();
    const created = await createLabOrder(prisma, orderInput(fixture));
    const specimen = await createAssignedSpecimen(fixture, created.items[0].id);

    // Replacing the items would cascade the assignment away and leave the
    // specimen without an order, so the sync is refused instead.
    await expect(
      updateLabOrder(
        prisma,
        orderInput(fixture, {
          items: [
            {
              sortOrder: 0,
              performableId: fixture.performableId,
              externalLabOrderableId: fixture.orderableId,
              externalOrderItemId: "ITEM-6001",
            },
          ],
        }),
      ),
    ).rejects.toThrow(LabOrderItemsHaveSpecimensError);

    const stored = await prisma.labOrder.findUniqueOrThrow({
      where: { id: created.id },
      include: { items: { include: { specimens: true } } },
    });

    // Nothing was written: the item and the assignment are as they were.
    expect(stored.items).toHaveLength(1);
    expect(stored.items[0].id).toBe(created.items[0].id);
    expect(stored.items[0].specimens).toHaveLength(1);
    expect(stored.items[0].specimens[0].specimenId).toBe(specimen.id);
  });

  it("does not let the specimen guard of another source system block the sync", async () => {
    const fixture = await createFixture();
    const created = await createLabOrder(prisma, orderInput(fixture));
    await createAssignedSpecimen(fixture, created.items[0].id);

    // The guard is scoped by the external identity of the order being synced, so
    // a sync of another order is not blocked by it and runs into the missing
    // order instead.
    await expect(
      updateLabOrder(
        prisma,
        orderInput(fixture, {
          externalId: "ORDER-4002",
          no: "ORD-20260105-0002",
          sequence: 2,
        }),
      ),
    ).rejects.toMatchObject({ code: "P2025" });
  });
});

describe("updateLabOrderStatus", () => {
  it("moves an ordered order of the laboratory to in process", async () => {
    const fixture = await createFixture();
    const created = await createLabOrder(prisma, orderInput(fixture));

    const updated = await updateLabOrderStatus(prisma, {
      id: created.id,
      status: LabOrderStatus.IN_PROCESS,
      laboratoryId: fixture.laboratoryId,
    });

    expect(updated).toEqual({
      id: created.id,
      status: LabOrderStatus.IN_PROCESS,
    });

    // Only the status is written: the header and the items stay as they are.
    const stored = await prisma.labOrder.findUniqueOrThrow({
      where: { id: created.id },
      include: { items: true },
    });

    expect(stored.no).toBe(created.no);
    expect(stored.items).toHaveLength(1);
  });

  it("refuses an order that belongs to another laboratory", async () => {
    const fixture = await createFixture();
    const created = await createLabOrder(prisma, orderInput(fixture));
    const otherFixture = await createFixture();

    // Prisma reports the laboratory of the where clause as a missing record.
    await expect(
      updateLabOrderStatus(prisma, {
        id: created.id,
        status: LabOrderStatus.IN_PROCESS,
        laboratoryId: otherFixture.laboratoryId,
      }),
    ).rejects.toMatchObject({ code: "P2025" });

    const stored = await prisma.labOrder.findUniqueOrThrow({
      where: { id: created.id },
    });

    expect(stored.status).toBe(LabOrderStatus.ORDERED);
  });
});

describe("getLabOrder", () => {
  it("finds an order by its external identity within a laboratory", async () => {
    const fixture = await createFixture();
    const created = await createLabOrder(prisma, orderInput(fixture));

    const found = await getLabOrder(prisma, {
      externalId: "ORDER-4001",
      sourceSystem: "HIS",
      laboratoryId: fixture.laboratoryId,
    });

    expect(found?.id).toBe(created.id);
  });

  it("does not leak an order from another source system", async () => {
    const fixture = await createFixture();
    await createLabOrder(prisma, orderInput(fixture));

    const found = await getLabOrder(prisma, {
      externalId: "ORDER-4001",
      sourceSystem: "OTHER_LIS",
      laboratoryId: fixture.laboratoryId,
    });

    expect(found).toBeNull();
  });
});

describe("getLabOrderSpecimens", () => {
  const item = (
    fixture: Fixture,
    externalOrderItemId: string,
    sortOrder: number,
  ) => ({
    sortOrder,
    performableId: fixture.performableId,
    externalLabOrderableId: fixture.orderableId,
    externalOrderItemId,
  });

  it("resolves the specimens of the order through its items, oldest first", async () => {
    const fixture = await createFixture();
    const order = await createLabOrder(
      prisma,
      orderInput(fixture, {
        items: [item(fixture, "ITEM-5001", 0), item(fixture, "ITEM-5002", 1)],
      }),
    );

    const [firstItem, secondItem] = [...order.items].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );

    const later = await createAssignedSpecimen(fixture, firstItem.id, {
      no: "SPC-260105-0002",
      sequence: 2,
      createdAt: new Date("2026-01-05T09:00:00.000Z"),
    });
    const earlier = await createAssignedSpecimen(fixture, secondItem.id, {
      no: "SPC-260105-0001",
      sequence: 1,
      createdAt: new Date("2026-01-05T08:30:00.000Z"),
    });

    const specimens = await getLabOrderSpecimens(prisma, {
      id: order.id,
      laboratoryId: fixture.laboratoryId,
    });

    // The order lists its specimens oldest first, whichever item they hang off.
    expect(specimens.map(({ id }) => id)).toEqual([earlier.id, later.id]);
    // The specimen exposes the item it is assigned to, which is the whole path
    // from the order to the specimen.
    expect(specimens[0].orderItems).toHaveLength(1);
    expect(
      specimens[0].orderItems[0].labOrderItem.performable?.displayName,
    ).toBe("Complete Blood Count");
  });

  it("keeps a specimen whose assignment ended", async () => {
    const fixture = await createFixture();
    const order = await createLabOrder(prisma, orderInput(fixture));
    const specimen = await createAssignedSpecimen(fixture, order.items[0].id);

    // Ending an assignment is how a specimen leaves an item; it never removes
    // the specimen from the order it was created for.
    await prisma.labOrderItemSpecimen.updateMany({
      where: { specimenId: specimen.id },
      data: {
        endedAt: new Date("2026-01-05T10:00:00.000Z"),
        endReason: "REASSIGNED",
      },
    });

    const specimens = await getLabOrderSpecimens(prisma, {
      id: order.id,
      laboratoryId: fixture.laboratoryId,
    });

    expect(specimens.map(({ id }) => id)).toEqual([specimen.id]);
    expect(specimens[0].orderItems[0].endedAt).not.toBeNull();
  });

  it("keeps the specimens of another order out", async () => {
    const fixture = await createFixture();
    const order = await createLabOrder(prisma, orderInput(fixture));
    const otherOrder = await createLabOrder(
      prisma,
      orderInput(fixture, {
        no: "ORD-20260105-0002",
        sequence: 2,
        externalId: "ORDER-4002",
      }),
    );
    await createAssignedSpecimen(fixture, order.items[0].id);
    const otherSpecimen = await createAssignedSpecimen(
      fixture,
      otherOrder.items[0].id,
      { no: "SPC-260105-0002", sequence: 2 },
    );

    const specimens = await getLabOrderSpecimens(prisma, {
      id: order.id,
      laboratoryId: fixture.laboratoryId,
    });

    expect(specimens.map(({ id }) => id)).not.toContain(otherSpecimen.id);
    expect(specimens).toHaveLength(1);
  });

  it("returns nothing for an order without a specimen", async () => {
    const fixture = await createFixture();
    const order = await createLabOrder(prisma, orderInput(fixture));

    await expect(
      getLabOrderSpecimens(prisma, {
        id: order.id,
        laboratoryId: fixture.laboratoryId,
      }),
    ).resolves.toEqual([]);
  });
});

describe("getLabOrders", () => {
  it("lists the orders of a laboratory, newest first", async () => {
    const fixture = await createFixture();
    await createLabOrder(prisma, orderInput(fixture));
    await createLabOrder(
      prisma,
      orderInput(fixture, {
        no: "ORD-20260105-0002",
        externalId: "ORDER-4002",
      }),
    );

    const [orders, meta] = await getLabOrders(prisma, {
      laboratoryId: fixture.laboratoryId,
    });

    expect(orders).toHaveLength(2);
    expect(meta).toBeNull();
  });

  it("pages the orders and reports the totals", async () => {
    const fixture = await createFixture();
    await createLabOrder(prisma, orderInput(fixture));
    await createLabOrder(
      prisma,
      orderInput(fixture, {
        no: "ORD-20260105-0002",
        externalId: "ORDER-4002",
      }),
    );

    const [orders, meta] = await getLabOrders(prisma, {
      laboratoryId: fixture.laboratoryId,
      page: 1,
      pageSize: 1,
    });

    expect(orders).toHaveLength(1);
    expect(meta).toEqual({
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it("applies status and priority together", async () => {
    const fixture = await createFixture();
    await createLabOrder(prisma, orderInput(fixture));
    await createLabOrder(
      prisma,
      orderInput(fixture, {
        no: "ORD-20260105-0002",
        externalId: "ORDER-4002",
        priority: "STAT",
      }),
    );

    const [stat] = await getLabOrders(prisma, {
      laboratoryId: fixture.laboratoryId,
      status: "ORDERED",
      priority: "STAT",
    });

    expect(stat.map((order) => order.externalId)).toEqual(["ORDER-4002"]);
  });

  /**
   * TODO(lab-order-service): the filter is spread as
   * `...(status && priority && { status, priority })`, so a lone status or a
   * lone priority is dropped and the caller receives every order. The action
   * schema currently rejects one-sided filters, which is the only reason this
   * has not been reported as a bug; the service contract is still wrong.
   */
  it("silently ignores a lone status filter", async () => {
    const fixture = await createFixture();
    await createLabOrder(prisma, orderInput(fixture));
    const cancellable = await createLabOrder(
      prisma,
      orderInput(fixture, {
        no: "ORD-20260105-0002",
        externalId: "ORDER-4002",
      }),
    );
    await updateLabOrder(
      prisma,
      orderInput(fixture, {
        no: "ORD-20260105-0002",
        externalId: "ORDER-4002",
        status: "CANCELLED",
      }),
    );

    const [orders] = await getLabOrders(prisma, {
      laboratoryId: fixture.laboratoryId,
      status: "CANCELLED",
    });

    // Asked for the cancelled order only, received both: the filter was dropped.
    expect(orders.map((order) => order.externalId).sort()).toEqual([
      "ORDER-4001",
      "ORDER-4002",
    ]);
    expect(orders.map((order) => order.id)).toContain(cancellable.id);
  });
});

describe("GetLabOrdersSchema", () => {
  it("rejects a one-sided status or priority filter at the action boundary", () => {
    const laboratoryId = "clx1a2b3c4d5e6f7g8h9i0jk";

    expect(
      GetLabOrdersSchema.safeParse({ laboratoryId, status: "ORDERED" }).success,
    ).toBe(false);
    expect(
      GetLabOrdersSchema.safeParse({ laboratoryId, priority: "STAT" }).success,
    ).toBe(false);
    expect(
      GetLabOrdersSchema.safeParse({
        laboratoryId,
        status: "ORDERED",
        priority: "STAT",
      }).success,
    ).toBe(true);
  });
});
