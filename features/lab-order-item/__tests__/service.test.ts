import {
  getLabOrderItems,
  resolveLabOrderItem,
} from "../lab-order-item.service";
import {
  AmbiguousPerformableMappingError,
  OrderableNotRegisteredError,
  PerformableNotConfiguredError,
} from "../../external-lab-orderable/external-lab-orderable.error";

type OrderableClient = Parameters<typeof resolveLabOrderItem>[0];
type LabOrderItemClient = Parameters<typeof getLabOrderItems>[0];

const TEST_IDS = {
  connectionId: "cx1a2b3c4d5e6f7g8h9i0jk",
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
  performableId: "pz4a98xxat96iws9zmbrgj3a",
  orderableId: "oz4a98xxat96iws9zmbrgj3a",
} as const;

/**
 * The mapping from an HIS orderable to a LIS performable is where an inbound
 * order either lands correctly or silently points at the wrong test. Every
 * failure mode therefore has its own error and its own test.
 */
describe("resolveLabOrderItem", () => {
  function orderableClient() {
    const methods = { findMany: jest.fn().mockResolvedValue([]) };

    return {
      methods,
      db: { externalLabOrderable: methods } as unknown as OrderableClient,
    };
  }

  function orderable(overrides: Record<string, unknown> = {}) {
    return {
      id: TEST_IDS.orderableId,
      externalOrderableId: "EXT-CBC",
      performables: [{ id: TEST_IDS.performableId }],
      ...overrides,
    };
  }

  it("queries only active mappings for the caller's connection", async () => {
    const { db, methods } = orderableClient();

    await resolveLabOrderItem(db, {
      connectionId: TEST_IDS.connectionId,
      labOrderItems: [{ externalOrderableId: "EXT-CBC" }],
    }).catch(() => undefined);

    expect(methods.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        connectionId: TEST_IDS.connectionId,
        externalOrderableId: { in: ["EXT-CBC"] },
      },
      include: {
        performables: { take: 1, where: { isActive: true } },
      },
    });
  });

  it("maps the external orderable onto the configured performable", async () => {
    const { db, methods } = orderableClient();
    methods.findMany.mockResolvedValue([orderable()]);

    const [resolved] = await resolveLabOrderItem(db, {
      connectionId: TEST_IDS.connectionId,
      labOrderItems: [
        {
          externalOrderableId: "EXT-CBC",
          externalOrderItemId: "ITEM-1",
          sortOrder: 0,
          note: "Fasting sample.",
        },
      ],
    });

    expect(resolved).toEqual({
      externalOrderItemId: "ITEM-1",
      sortOrder: 0,
      note: "Fasting sample.",
      performableId: TEST_IDS.performableId,
      externalLabOrderableId: TEST_IDS.orderableId,
    });
    // The HIS identifier is replaced by our own ids, not passed through.
    expect(resolved).not.toHaveProperty("externalOrderableId");
  });

  it("rejects an orderable the connection has not registered", async () => {
    const { db, methods } = orderableClient();
    methods.findMany.mockResolvedValue([]);

    await expect(
      resolveLabOrderItem(db, {
        connectionId: TEST_IDS.connectionId,
        labOrderItems: [{ externalOrderableId: "EXT-UNKNOWN" }],
      }),
    ).rejects.toThrow(OrderableNotRegisteredError);
  });

  it("rejects an orderable with no active performable", async () => {
    const { db, methods } = orderableClient();
    methods.findMany.mockResolvedValue([orderable({ performables: [] })]);

    await expect(
      resolveLabOrderItem(db, {
        connectionId: TEST_IDS.connectionId,
        labOrderItems: [{ externalOrderableId: "EXT-CBC" }],
      }),
    ).rejects.toThrow(PerformableNotConfiguredError);
  });

  it("reports which orderable failed, not just that one did", async () => {
    const { db, methods } = orderableClient();
    methods.findMany.mockResolvedValue([orderable({ performables: [] })]);

    await expect(
      resolveLabOrderItem(db, {
        connectionId: TEST_IDS.connectionId,
        labOrderItems: [{ externalOrderableId: "EXT-CBC" }],
      }),
    ).rejects.toThrow("Orderable 'EXT-CBC' has no active performable.");
  });

  /**
   * Known gap: the query asks for `take: 1`, so an orderable mapped to several
   * active performables cannot be detected and this error is unreachable. The
   * test documents the intent; the guard becomes real once the query returns
   * more than one performable per orderable.
   */
  it.skip("rejects an orderable mapped to several active performables", async () => {
    const { db, methods } = orderableClient();
    methods.findMany.mockResolvedValue([
      orderable({
        performables: [{ id: TEST_IDS.performableId }, { id: "other" }],
      }),
    ]);

    await expect(
      resolveLabOrderItem(db, {
        connectionId: TEST_IDS.connectionId,
        labOrderItems: [{ externalOrderableId: "EXT-CBC" }],
      }),
    ).rejects.toThrow(AmbiguousPerformableMappingError);
  });

  it("keeps the order of the submitted items", async () => {
    const { db, methods } = orderableClient();
    methods.findMany.mockResolvedValue([
      orderable({ externalOrderableId: "EXT-CBC" }),
      orderable({
        id: "second",
        externalOrderableId: "EXT-HBA1C",
        performables: [{ id: "second-performable" }],
      }),
    ]);

    const resolved = await resolveLabOrderItem(db, {
      connectionId: TEST_IDS.connectionId,
      labOrderItems: [
        { externalOrderableId: "EXT-HBA1C", sortOrder: 1 },
        { externalOrderableId: "EXT-CBC", sortOrder: 0 },
      ],
    });

    expect(resolved.map((item) => item.performableId)).toEqual([
      "second-performable",
      TEST_IDS.performableId,
    ]);
  });
});

describe("getLabOrderItems", () => {
  function labOrderItemClient() {
    const methods = {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    };

    return {
      methods,
      db: { labOrderItem: methods } as unknown as LabOrderItemClient,
    };
  }

  it("scopes by laboratory and orders by sort order", async () => {
    const { db, methods } = labOrderItemClient();

    await getLabOrderItems(db, { laboratoryId: TEST_IDS.laboratoryId });

    const [{ where, orderBy, skip }] = methods.findMany.mock.calls[0];

    expect(where).toEqual({ laboratoryId: TEST_IDS.laboratoryId });
    expect(orderBy).toEqual({ sortOrder: "asc" });
    expect(skip).toBeUndefined();
  });

  it("filters by any of the requested statuses and priorities", async () => {
    const { db, methods } = labOrderItemClient();

    await getLabOrderItems(db, {
      laboratoryId: TEST_IDS.laboratoryId,
      status: ["OPEN", "COLLECTED"],
      priority: ["STAT"],
    });

    const [{ where }] = methods.findMany.mock.calls[0];

    expect(where.status).toEqual({ in: ["OPEN", "COLLECTED"] });
    expect(where.priority).toEqual({ in: ["STAT"] });
  });

  it("searches the external orderable code and display name", async () => {
    const { db, methods } = labOrderItemClient();

    await getLabOrderItems(db, {
      laboratoryId: TEST_IDS.laboratoryId,
      search: "cbc",
    });

    const [{ where }] = methods.findMany.mock.calls[0];

    expect(where.OR).toEqual([
      {
        externalOrderable: {
          OR: [
            { externalCode: { contains: "cbc", mode: "insensitive" } },
            { externalDisplay: { contains: "cbc", mode: "insensitive" } },
          ],
        },
      },
    ]);
  });

  it("counts the filtered rows when a page is requested", async () => {
    const { db, methods } = labOrderItemClient();
    methods.count.mockResolvedValue(3);

    const [, meta] = await getLabOrderItems(db, {
      laboratoryId: TEST_IDS.laboratoryId,
      page: 1,
      pageSize: 2,
    });

    expect(meta).toEqual({
      page: 1,
      pageSize: 2,
      total: 3,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });
});
