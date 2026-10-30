import {
  AuditLogEntityType,
  LabOrderStatus,
  Role,
  SpecimenAssignmentEndReason,
  SpecimenCancellationReason,
  SpecimenRejectionReason,
  SpecimenStatus,
} from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import { createAuditLog } from "@/features/audit-log/audit-log.service";
import { getLabOrder } from "@/features/lab-order/lab-order.service";
import {
  getSpecimenPersonnelCandidate,
  getSpecimenPersonnelCandidates,
} from "@/features/user/user.service";
import { updateManyLabOrderItemSpecimen } from "@/features/lab-order-item-specimen/lab-order-item-specimen.service";
import {
  ensureSpecimenCanBeCollected,
  ensureSpecimenCanBeReceived,
  ensureSpecimenIsEditable,
  resolveCollectedStatus,
  resolveReceivedStatus,
} from "../specimen.policy";
import {
  collectSpecimen,
  getSpecimen,
  receiveSpecimen,
  updateSpecimen,
} from "../specimen.service";
import {
  collectSpecimenAction,
  getSpecimenPersonnelCandidatesAction,
  receiveSpecimenAction,
  updateSpecimenAction,
} from "../specimen.action";

/**
 * The status transitions of a specimen: collecting, receiving, rejecting and
 * cancelling. Each one writes a record, ends the assignment history that no
 * longer applies and leaves an audit trail, so every flow is asserted on the
 * payload it writes rather than on the row it returns.
 */

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { $transaction: jest.fn() },
}));
jest.mock("@/lib/ensure-user-authenticated", () => ({
  __esModule: true,
  ensureUserAuthenticated: jest.fn(),
}));
jest.mock("@/features/audit-log/audit-log.service", () => ({
  __esModule: true,
  createAuditLog: jest.fn(),
}));
jest.mock("@/features/lab-order/lab-order.service", () => ({
  __esModule: true,
  getLabOrder: jest.fn(),
}));
jest.mock("@/features/user/user.service", () => ({
  __esModule: true,
  getSpecimenPersonnelCandidate: jest.fn(),
  getSpecimenPersonnelCandidates: jest.fn(),
}));
jest.mock(
  "@/features/lab-order-item-specimen/lab-order-item-specimen.service",
  () => ({
    __esModule: true,
    updateManyLabOrderItemSpecimen: jest.fn(),
  }),
);
jest.mock("../specimen.service", () => ({
  __esModule: true,
  getSpecimen: jest.fn(),
  createSpecimen: jest.fn(),
  updateSpecimen: jest.fn(),
  collectSpecimen: jest.fn(),
  receiveSpecimen: jest.fn(),
  reserveSpecimenNo: jest.fn(),
}));
// The transition rules themselves are covered by `policy.test.ts`; here the
// action is only responsible for calling them and honouring their verdict.
jest.mock("../specimen.policy", () => ({
  __esModule: true,
  ensureSpecimenIsEditable: jest.fn(),
  ensureSpecimenCanBeCollected: jest.fn(),
  ensureSpecimenCanBeReceived: jest.fn(),
  resolveCollectedStatus: jest.fn(),
  resolveReceivedStatus: jest.fn(),
}));

const transaction = (prisma as unknown as { $transaction: jest.Mock })
  .$transaction;
const authenticatedUser = ensureUserAuthenticated as jest.Mock;
const mockCreateAuditLog = createAuditLog as jest.Mock;
const mockGetLabOrder = getLabOrder as jest.Mock;
const mockGetPersonnelCandidate = getSpecimenPersonnelCandidate as jest.Mock;
const mockGetPersonnelCandidates = getSpecimenPersonnelCandidates as jest.Mock;
const mockUpdateMany = updateManyLabOrderItemSpecimen as jest.Mock;
const mockCollectSpecimen = collectSpecimen as jest.Mock;
const mockGetSpecimen = getSpecimen as jest.Mock;
const mockReceiveSpecimen = receiveSpecimen as jest.Mock;
const mockUpdateSpecimen = updateSpecimen as jest.Mock;
const mockEnsureEditable = ensureSpecimenIsEditable as jest.Mock;
const mockEnsureCanBeCollected = ensureSpecimenCanBeCollected as jest.Mock;
const mockEnsureCanBeReceived = ensureSpecimenCanBeReceived as jest.Mock;
const mockResolveCollectedStatus = resolveCollectedStatus as jest.Mock;
const mockResolveReceivedStatus = resolveReceivedStatus as jest.Mock;

const TEST_IDS = {
  actorId: "tz4a98xxat96iws9zmbrgj3a",
  specimenId: "ckqp6y6q50000qzrm8b1v3f7d",
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
  labOrderId: "cm9z8y7x6w5v4u3t2s1r0qpo",
  orderItemId: "c9wq3x1v70000qzrm5t2h8k4d",
  collectorId: "cb2n3m4k5j6h7g8f9d0s1a2q",
  receiverId: "cc3m4n5b6v7c8x9z0l1k2j3h",
  otherSpecimenId: "cf5n6m7b8v9c0x1z2l3k4j5h",
  itemKeepActive: "citemkeepactive0000000001",
  itemKeepEnded: "citemkeepended00000000002",
  specimenTypeId: "cspecimentype00000000001",
  itemDropped: "citemdropped000000000003",
  itemNew: "citemnew000000000000000004",
  relationKeepActive: "crelkeepactive00000000001",
  relationKeepEnded: "crelkeepended000000000002",
  relationDropped: "creldropped0000000000003",
  relationNew: "crelnew000000000000000004",
} as const;

const HOUR = 60 * 60 * 1000;
const collectedAt = new Date(Date.now() - 2 * HOUR);
const receivedAt = new Date(Date.now() - HOUR);
const createdAt = new Date("2026-01-05T08:00:00.000Z");

const STAFF_USER = {
  id: TEST_IDS.actorId,
  name: "Specimen Staff",
  role: Role.STAFF,
  username: "specimen_staff",
  laboratoryId: TEST_IDS.laboratoryId,
};

function makeLabOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: TEST_IDS.labOrderId,
    status: LabOrderStatus.ORDERED,
    items: [{ id: TEST_IDS.orderItemId, specimens: [] }],
    ...overrides,
  };
}

function makeSpecimenRow(overrides: Record<string, unknown> = {}) {
  return {
    id: TEST_IDS.specimenId,
    no: "2601050001",
    period: "260105",
    sequence: 1,
    note: null,
    status: SpecimenStatus.PENDING,
    rejectionReason: null,
    cancellationReason: null,
    labOrderId: TEST_IDS.labOrderId,
    collectedAt: null,
    collectedById: null,
    collectedBy: null,
    receivedAt: null,
    receivedById: null,
    receivedBy: null,
    rejectedAt: null,
    cancelledAt: null,
    createdAt,
    updatedAt: createdAt,
    orderItems: [],
    specimenType: { id: "cv4b5n6m7q8w9e0r1t2y3u4i", name: "Whole blood" },
    ...overrides,
  };
}

const collectParams = {
  id: TEST_IDS.specimenId,
  labOrderId: TEST_IDS.labOrderId,
  collectedAt,
  collectedById: TEST_IDS.collectorId,
};

const receiveParams = {
  id: TEST_IDS.specimenId,
  labOrderId: TEST_IDS.labOrderId,
  receivedAt,
  receivedById: TEST_IDS.receiverId,
};

beforeEach(() => {
  transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
    callback({}),
  );
  authenticatedUser.mockResolvedValue(STAFF_USER);
  // By default every transition is allowed and the status is left as it is;
  // each test overrides the one rule it is about.
  mockEnsureEditable.mockReturnValue(undefined);
  mockEnsureCanBeCollected.mockReturnValue(undefined);
  mockEnsureCanBeReceived.mockReturnValue(undefined);
  mockResolveCollectedStatus.mockImplementation(
    (status: SpecimenStatus) => status,
  );
  mockResolveReceivedStatus.mockImplementation(
    (status: SpecimenStatus) => status,
  );
  mockGetLabOrder.mockResolvedValue(makeLabOrder());
  mockGetSpecimen.mockResolvedValue(makeSpecimenRow());
  mockGetPersonnelCandidate.mockResolvedValue({
    id: TEST_IDS.collectorId,
    name: "Collector",
    username: "collector",
  });
  mockGetPersonnelCandidates.mockResolvedValue([
    { id: TEST_IDS.collectorId, name: "Collector", username: "collector" },
  ]);
  mockUpdateSpecimen.mockResolvedValue(makeSpecimenRow());
  mockCollectSpecimen.mockResolvedValue(
    makeSpecimenRow({
      status: SpecimenStatus.COLLECTED,
      collectedAt,
      collectedById: TEST_IDS.collectorId,
    }),
  );
  mockReceiveSpecimen.mockResolvedValue(
    makeSpecimenRow({
      status: SpecimenStatus.RECEIVED,
      collectedAt,
      receivedAt,
      receivedById: TEST_IDS.receiverId,
    }),
  );
  mockUpdateMany.mockResolvedValue({ count: 1 });
  mockCreateAuditLog.mockResolvedValue({ id: "audit_log_id" });
});

describe("updateSpecimenAction — cancellation", () => {
  it("cancels the specimen, ends every active assignment and audits the reason", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({ status: SpecimenStatus.COLLECTED, collectedAt }),
    );
    mockUpdateSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.CANCELLED,
        collectedAt,
        cancelledAt: new Date(),
      }),
    );

    const { data } = await updateSpecimenAction({
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      cancellationReason: SpecimenCancellationReason.DUPLICATE_SPECIMEN,
      additionalReason: "A second sample arrived from the same draw.",
    });

    const written = mockUpdateSpecimen.mock.calls[0][1] as {
      status: SpecimenStatus;
      cancelledAt: Date;
    };

    expect(written.status).toBe(SpecimenStatus.CANCELLED);
    // The cancellation time is the same instant the assignments end at, so the
    // history never shows an assignment ending before the cancellation.
    expect(written.cancelledAt).toEqual(expect.any(Date));
    expect(mockUpdateMany).toHaveBeenCalledWith(expect.anything(), {
      endedAt: written.cancelledAt,
      endReason: SpecimenAssignmentEndReason.SPECIMEN_CANCELLED,
      onlyActive: true,
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
    });
    expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.anything(), {
      action: "SPECIMEN_CANCELLED",
      reason: "A second sample arrived from the same draw.",
      actorId: TEST_IDS.actorId,
      entityId: TEST_IDS.specimenId,
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId: TEST_IDS.laboratoryId,
      metadata: { previousStatus: SpecimenStatus.COLLECTED },
    });
    expect(data.status).toBe(SpecimenStatus.CANCELLED);
  });

  it("never writes a receipt record when cancelling", async () => {
    await updateSpecimenAction({
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      cancellationReason: SpecimenCancellationReason.NO_LONGER_NEEDED,
    });

    const written = mockUpdateSpecimen.mock.calls[0][1] as Record<
      string,
      unknown
    >;

    expect(written).not.toHaveProperty("receivedAt");
    expect(written).not.toHaveProperty("rejectedAt");
    expect(written).toHaveProperty("cancelledAt");
  });
});

describe("updateSpecimenAction — rejection", () => {
  it("rejects the specimen, ends every active assignment and audits the reason", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.RECEIVED,
        collectedAt,
        receivedAt,
      }),
    );
    mockUpdateSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.REJECTED,
        collectedAt,
        rejectedAt: new Date(),
      }),
    );

    const { data } = await updateSpecimenAction({
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      rejectionReason: SpecimenRejectionReason.HEMOLYZED,
      additionalReason: "Sample arrived haemolysed.",
    });

    const written = mockUpdateSpecimen.mock.calls[0][1] as {
      status: SpecimenStatus;
      rejectedAt: Date;
    };

    expect(written.status).toBe(SpecimenStatus.REJECTED);
    expect(written.rejectedAt).toEqual(expect.any(Date));
    expect(mockUpdateMany).toHaveBeenCalledWith(expect.anything(), {
      endedAt: written.rejectedAt,
      endReason: SpecimenAssignmentEndReason.SPECIMEN_REJECTED,
      onlyActive: true,
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
    });
    expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.anything(), {
      action: "SPECIMEN_REJECTED",
      reason: "Sample arrived haemolysed.",
      actorId: TEST_IDS.actorId,
      entityId: TEST_IDS.specimenId,
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId: TEST_IDS.laboratoryId,
      metadata: { previousStatus: SpecimenStatus.RECEIVED },
    });
    expect(data.status).toBe(SpecimenStatus.REJECTED);
  });

  it("keeps the cancellation record untouched when rejecting", async () => {
    await updateSpecimenAction({
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      rejectionReason: SpecimenRejectionReason.CLOTTED,
    });

    const written = mockUpdateSpecimen.mock.calls[0][1] as Record<
      string,
      unknown
    >;

    expect(written).not.toHaveProperty("cancelledAt");
    expect(written).toHaveProperty("rejectedAt");
  });
});

describe("updateSpecimenAction — order item assignment", () => {
  const endedAt = new Date("2026-01-04T08:00:00.000Z");
  const assignedAt = new Date("2026-01-02T08:00:00.000Z");

  it("only creates the assignments the caller added and ends the dropped ones", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.COLLECTED,
        collectedAt,
        orderItems: [
          {
            id: TEST_IDS.relationKeepActive,
            endedAt: null,
            assignedAt,
            labOrderItem: { id: TEST_IDS.itemKeepActive },
          },
          {
            id: TEST_IDS.relationKeepEnded,
            endedAt,
            assignedAt,
            labOrderItem: { id: TEST_IDS.itemKeepEnded },
          },
          {
            id: TEST_IDS.relationDropped,
            endedAt: null,
            assignedAt,
            labOrderItem: { id: TEST_IDS.itemDropped },
          },
        ],
      }),
    );
    mockUpdateSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.COLLECTED,
        collectedAt,
        orderItems: [
          {
            id: TEST_IDS.relationNew,
            endedAt: null,
            assignedAt,
            labOrderItem: { id: TEST_IDS.itemNew },
          },
          {
            id: TEST_IDS.relationKeepEnded,
            endedAt,
            assignedAt,
            labOrderItem: { id: TEST_IDS.itemKeepEnded },
          },
        ],
      }),
    );

    await updateSpecimenAction({
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      specimenTypeId: TEST_IDS.specimenTypeId,
      orderItemIds: [
        TEST_IDS.itemKeepActive,
        TEST_IDS.itemKeepEnded,
        TEST_IDS.itemNew,
      ],
    });

    // An assignment that is selected and still active is kept as it is, while an
    // assignment that was ended before is re-created because it is selected
    // again.
    const written = mockUpdateSpecimen.mock.calls[0][1] as {
      orderItemIds: string[];
    };

    expect(written.orderItemIds).toEqual([
      TEST_IDS.itemKeepEnded,
      TEST_IDS.itemNew,
    ]);
    expect(mockUpdateMany).toHaveBeenCalledWith(expect.anything(), {
      endedAt: expect.any(Date),
      endReason: SpecimenAssignmentEndReason.REASSIGNED,
      onlyActive: true,
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      excludedLabOrderItemIds: [
        TEST_IDS.itemKeepActive,
        TEST_IDS.itemKeepEnded,
      ],
    });
    expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.anything(), {
      action: "SPECIMEN_REASSIGNED",
      actorId: TEST_IDS.actorId,
      entityId: TEST_IDS.specimenId,
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId: TEST_IDS.laboratoryId,
      metadata: {
        endedLabOrderItemSpecimenIds: [TEST_IDS.relationDropped],
        // Only the relation that is still active counts as newly created.
        createdLabOrderItemSpecimenIds: [TEST_IDS.relationNew],
      },
    });
  });

  it("writes the fields without touching the assignment history", async () => {
    const { data } = await updateSpecimenAction({
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      note: "Slightly lipemic.",
    });

    expect(mockUpdateMany).not.toHaveBeenCalled();
    expect(mockCreateAuditLog).not.toHaveBeenCalled();
    expect(data.id).toBe(TEST_IDS.specimenId);
  });

  it("refuses an order that does not exist", async () => {
    mockGetLabOrder.mockResolvedValue(null);

    await expect(
      updateSpecimenAction({
        id: TEST_IDS.specimenId,
        labOrderId: TEST_IDS.labOrderId,
        note: "Slightly lipemic.",
      }),
    ).rejects.toThrow("Order is not found");
    expect(mockGetSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a specimen that does not exist", async () => {
    mockGetSpecimen.mockResolvedValue(null);

    await expect(
      updateSpecimenAction({
        id: TEST_IDS.specimenId,
        labOrderId: TEST_IDS.labOrderId,
        note: "Slightly lipemic.",
      }),
    ).rejects.toThrow("Specimen is not found");
    expect(mockUpdateSpecimen).not.toHaveBeenCalled();
  });
});

describe("collectSpecimenAction", () => {
  it("logs the collection of a pending specimen and audits the collector", async () => {
    mockResolveCollectedStatus.mockReturnValue(SpecimenStatus.COLLECTED);

    const { data } = await collectSpecimenAction(collectParams);

    // A pending specimen is handed to the rule that decides the next status.
    expect(mockResolveCollectedStatus).toHaveBeenCalledWith(
      SpecimenStatus.PENDING,
    );
    expect(mockEnsureEditable).toHaveBeenCalledWith(
      expect.objectContaining({ status: SpecimenStatus.PENDING }),
    );
    expect(mockEnsureCanBeCollected).toHaveBeenCalledWith(
      expect.objectContaining({ status: SpecimenStatus.PENDING }),
    );
    expect(mockCollectSpecimen).toHaveBeenCalledWith(expect.anything(), {
      ...collectParams,
      laboratoryId: TEST_IDS.laboratoryId,
      status: SpecimenStatus.COLLECTED,
    });
    expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.anything(), {
      action: "SPECIMEN_COLLECTED",
      actorId: TEST_IDS.actorId,
      entityId: TEST_IDS.specimenId,
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId: TEST_IDS.laboratoryId,
      metadata: {
        previousStatus: SpecimenStatus.PENDING,
        status: SpecimenStatus.COLLECTED,
        previousCollectedAt: null,
        collectedAt: collectedAt.toISOString(),
        collectedById: TEST_IDS.collectorId,
        collectedByName: "Collector",
      },
    });
    expect(data.collectedAt).toBe(collectedAt.toISOString());
  });

  it("keeps the status when correcting a received specimen and falls back to the username", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.RECEIVED,
        collectedAt,
        receivedAt,
      }),
    );
    mockGetPersonnelCandidate.mockResolvedValue({
      id: TEST_IDS.collectorId,
      name: null,
      username: "collector",
    });
    mockCollectSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.RECEIVED,
        collectedAt,
        receivedAt,
      }),
    );

    await collectSpecimenAction(collectParams);

    expect(mockCollectSpecimen).toHaveBeenCalledWith(expect.anything(), {
      ...collectParams,
      laboratoryId: TEST_IDS.laboratoryId,
      status: SpecimenStatus.RECEIVED,
    });

    const audit = mockCreateAuditLog.mock.calls[0][1] as {
      metadata: Record<string, unknown>;
    };

    // Correcting the collection record rewrites the same instant, so the audit
    // entry shows a before and an after value that are both set.
    expect(audit.metadata).toMatchObject({
      previousStatus: SpecimenStatus.RECEIVED,
      status: SpecimenStatus.RECEIVED,
      previousCollectedAt: collectedAt.toISOString(),
      collectedByName: "collector",
    });
  });

  it("refuses a specimen that belongs to another order", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({ labOrderId: TEST_IDS.otherSpecimenId }),
    );

    await expect(collectSpecimenAction(collectParams)).rejects.toThrow(
      "Specimen is not part of this order",
    );
    expect(mockCollectSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a collection time after the specimen was received", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.RECEIVED,
        collectedAt,
        receivedAt,
      }),
    );

    await expect(
      collectSpecimenAction({ ...collectParams, collectedAt: new Date() }),
    ).rejects.toThrow(
      "Collection time cannot be after the specimen is received",
    );
    expect(mockCollectSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a collector outside the caller's laboratory", async () => {
    mockGetPersonnelCandidate.mockResolvedValue(null);

    await expect(collectSpecimenAction(collectParams)).rejects.toThrow(
      "Collector is not found",
    );
    expect(mockCollectSpecimen).not.toHaveBeenCalled();
    expect(mockCreateAuditLog).not.toHaveBeenCalled();
  });

  it("refuses a cancelled specimen", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({ status: SpecimenStatus.CANCELLED }),
    );
    mockEnsureEditable.mockImplementationOnce(() => {
      throw new Error("Specimen is not editable");
    });

    await expect(collectSpecimenAction(collectParams)).rejects.toThrow(
      "Specimen is not editable",
    );
    expect(mockEnsureEditable).toHaveBeenCalledWith(
      expect.objectContaining({ status: SpecimenStatus.CANCELLED }),
    );
    expect(mockCollectSpecimen).not.toHaveBeenCalled();
  });

  it("refuses an order that does not exist in the caller's laboratory", async () => {
    mockGetLabOrder.mockResolvedValue(null);

    await expect(collectSpecimenAction(collectParams)).rejects.toThrow(
      "Order is not found",
    );
    expect(mockGetSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a specimen that is not in the caller's laboratory", async () => {
    mockGetSpecimen.mockResolvedValue(null);

    await expect(collectSpecimenAction(collectParams)).rejects.toThrow(
      "Specimen is not found",
    );
    expect(mockCollectSpecimen).not.toHaveBeenCalled();
  });
});

describe("receiveSpecimenAction", () => {
  it("receives a collected specimen and audits the receiver", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({ status: SpecimenStatus.COLLECTED, collectedAt }),
    );
    mockResolveReceivedStatus.mockReturnValue(SpecimenStatus.RECEIVED);

    const { data } = await receiveSpecimenAction(receiveParams);

    expect(mockResolveReceivedStatus).toHaveBeenCalledWith(
      SpecimenStatus.COLLECTED,
    );
    expect(mockEnsureCanBeReceived).toHaveBeenCalledWith(
      expect.objectContaining({ status: SpecimenStatus.COLLECTED }),
    );
    expect(mockReceiveSpecimen).toHaveBeenCalledWith(expect.anything(), {
      ...receiveParams,
      laboratoryId: TEST_IDS.laboratoryId,
      status: SpecimenStatus.RECEIVED,
    });
    expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.anything(), {
      action: "SPECIMEN_RECEIVED",
      actorId: TEST_IDS.actorId,
      entityId: TEST_IDS.specimenId,
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId: TEST_IDS.laboratoryId,
      metadata: {
        previousStatus: SpecimenStatus.COLLECTED,
        status: SpecimenStatus.RECEIVED,
        previousReceivedAt: null,
        receivedAt: receivedAt.toISOString(),
        previousReceivedById: null,
        receivedById: TEST_IDS.receiverId,
        receivedByName: "Collector",
        previousNote: null,
        note: null,
      },
    });
    expect(data.receivedAt).toBe(receivedAt.toISOString());
  });

  it("keeps the status when correcting the receipt record of a received specimen", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.RECEIVED,
        collectedAt,
        receivedAt,
        receivedById: TEST_IDS.receiverId,
        note: "stored in the cold room",
      }),
    );

    await receiveSpecimenAction({ ...receiveParams, note: "" });

    expect(mockReceiveSpecimen).toHaveBeenCalledWith(expect.anything(), {
      ...receiveParams,
      note: "",
      laboratoryId: TEST_IDS.laboratoryId,
      status: SpecimenStatus.RECEIVED,
    });

    const audit = mockCreateAuditLog.mock.calls[0][1] as {
      metadata: Record<string, unknown>;
    };

    expect(audit.metadata).toMatchObject({
      previousReceivedAt: receivedAt.toISOString(),
      previousReceivedById: TEST_IDS.receiverId,
      previousNote: "stored in the cold room",
      // The service turns the empty note into a cleared column.
      note: null,
    });
  });

  it("falls back to the username of a receiver who has no display name", async () => {
    mockGetPersonnelCandidate.mockResolvedValue({
      id: TEST_IDS.receiverId,
      name: null,
      username: "receiver",
    });

    await receiveSpecimenAction(receiveParams);

    const audit = mockCreateAuditLog.mock.calls[0][1] as {
      metadata: Record<string, unknown>;
    };

    expect(audit.metadata).toMatchObject({
      receivedById: TEST_IDS.receiverId,
      receivedByName: "receiver",
    });
  });

  it("refuses an order that does not exist in the caller's laboratory", async () => {
    mockGetLabOrder.mockResolvedValue(null);

    await expect(receiveSpecimenAction(receiveParams)).rejects.toThrow(
      "Order is not found",
    );
    expect(mockGetSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a specimen that is not in the caller's laboratory", async () => {
    mockGetSpecimen.mockResolvedValue(null);

    await expect(receiveSpecimenAction(receiveParams)).rejects.toThrow(
      "Specimen is not found",
    );
    expect(mockReceiveSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a specimen that belongs to another order", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({
        status: SpecimenStatus.COLLECTED,
        labOrderId: TEST_IDS.otherSpecimenId,
      }),
    );

    await expect(receiveSpecimenAction(receiveParams)).rejects.toThrow(
      "Specimen is not part of this order",
    );
    expect(mockReceiveSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a receipt time before the specimen was collected", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({ status: SpecimenStatus.COLLECTED, collectedAt }),
    );

    await expect(
      receiveSpecimenAction({
        ...receiveParams,
        receivedAt: new Date(collectedAt.getTime() - HOUR),
      }),
    ).rejects.toThrow(
      "Received time cannot be before the specimen is collected",
    );
    expect(mockReceiveSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a receiver outside the caller's laboratory", async () => {
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({ status: SpecimenStatus.COLLECTED, collectedAt }),
    );
    mockGetPersonnelCandidate.mockResolvedValue(null);

    await expect(receiveSpecimenAction(receiveParams)).rejects.toThrow(
      "Receiver is not found",
    );
    expect(mockReceiveSpecimen).not.toHaveBeenCalled();
    expect(mockCreateAuditLog).not.toHaveBeenCalled();
  });

  it("refuses a specimen that cannot be received before it is collected", async () => {
    mockGetSpecimen.mockResolvedValue(makeSpecimenRow());
    mockEnsureCanBeReceived.mockImplementationOnce(() => {
      throw new Error("Specimen cannot be received");
    });

    await expect(receiveSpecimenAction(receiveParams)).rejects.toThrow(
      "Specimen cannot be received",
    );
    expect(mockEnsureCanBeReceived).toHaveBeenCalledWith(
      expect.objectContaining({ status: SpecimenStatus.PENDING }),
    );
    expect(mockReceiveSpecimen).not.toHaveBeenCalled();
  });
});

describe("getSpecimenPersonnelCandidatesAction", () => {
  it("returns the personnel of the caller's laboratory", async () => {
    const { data } = await getSpecimenPersonnelCandidatesAction();

    expect(mockGetPersonnelCandidates).toHaveBeenCalledWith(prisma, {
      laboratoryId: TEST_IDS.laboratoryId,
    });
    expect(data).toEqual([
      { id: TEST_IDS.collectorId, name: "Collector", username: "collector" },
    ]);
  });
});

describe("authorization", () => {
  const deniedCases: Array<[string, Role, () => Promise<unknown>]> = [
    [
      "updateSpecimenAction",
      Role.DOCTOR,
      () =>
        updateSpecimenAction({
          id: TEST_IDS.specimenId,
          labOrderId: TEST_IDS.labOrderId,
          note: "Slightly lipemic.",
        }),
    ],
    [
      "collectSpecimenAction",
      Role.LAB_ADMIN,
      () => collectSpecimenAction(collectParams),
    ],
    [
      "receiveSpecimenAction",
      Role.DOCTOR,
      () => receiveSpecimenAction(receiveParams),
    ],
    [
      "getSpecimenPersonnelCandidatesAction",
      Role.LAB_ADMIN,
      () => getSpecimenPersonnelCandidatesAction(),
    ],
  ];

  it.each(deniedCases)(
    "%s refuses a caller without the permission before opening a transaction",
    async (_action, role, run) => {
      authenticatedUser.mockResolvedValue({ ...STAFF_USER, role });

      await expect(run()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
        statusCode: 422,
      });
      expect(transaction).not.toHaveBeenCalled();
      expect(mockCreateAuditLog).not.toHaveBeenCalled();
    },
  );
});
