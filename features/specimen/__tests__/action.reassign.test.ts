import {
  AuditLogEntityType,
  LabOrderItemStatus,
  LabOrderStatus,
  Role,
  SpecimenAssignmentEndReason,
  SpecimenStatus,
} from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import { createAuditLog } from "@/features/audit-log/audit-log.service";
import { getLabOrder } from "@/features/lab-order/lab-order.service";
import { updateManyLabOrderItemSpecimen } from "@/features/lab-order-item-specimen/lab-order-item-specimen.service";
import { getSpecimen, updateSpecimen } from "../specimen.service";
import { updateSpecimenAction } from "../specimen.action";

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
  updateLabOrderStatus: jest.fn(),
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
  reuseSpecimen: jest.fn(),
}));

const transaction = (prisma as unknown as { $transaction: jest.Mock })
  .$transaction;
const authenticatedUser = ensureUserAuthenticated as jest.Mock;
const mockCreateAuditLog = createAuditLog as jest.Mock;
const mockGetLabOrder = getLabOrder as jest.Mock;
const mockUpdateMany = updateManyLabOrderItemSpecimen as jest.Mock;
const mockGetSpecimen = getSpecimen as jest.Mock;
const mockUpdateSpecimen = updateSpecimen as jest.Mock;

const TEST_IDS = {
  actorId: "tz4a98xxat96iws9zmbrgj3a",
  specimenId: "ckqp6y6q50000qzrm8b1v3f7d",
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
  labOrderId: "cm9z8y7x6w5v4u3t2s1r0qpo",
  keptOrderItemId: "c9wq3x1v70000qzrm5t2h8k4d",
  droppedOrderItemId: "c1b2n3m4k5j6h7g8f9d0s1a2",
  freeOrderItemId: "cz1x2c3v4b5n6m7q8w9e0r1t",
  takenOrderItemId: "cb2n3m4k5j6h7g8f9d0s1a2q",
  specimenTypeId: "cv4b5n6m7q8w9e0r1t2y3u4i",
  patientId: "ca1s2d3f4g5h6j7k8l9z0x1c2",
} as const;

const collectedAt = new Date("2026-01-05T07:00:00.000Z");
const createdAt = new Date("2026-01-05T08:00:00.000Z");

const STAFF_USER = {
  id: TEST_IDS.actorId,
  name: "Specimen Staff",
  role: Role.STAFF,
  username: "specimen_staff",
  laboratoryId: TEST_IDS.laboratoryId,
};

function assignment(
  id: string,
  labOrderItemId: string,
  endedAt: Date | null = null,
) {
  return {
    id,
    endedAt,
    endReason: endedAt ? SpecimenAssignmentEndReason.REASSIGNED : null,
    assignedAt: createdAt,
    labOrderItem: {
      id: labOrderItemId,
      note: null,
      status: LabOrderItemStatus.ORDERED,
      priority: "ROUTINE",
      sortOrder: 1,
      performableSnapshot: null,
      specimenTypeCodeSnapshot: null,
      specimenTypeDisplaySnapshot: null,
      performable: {
        id: "cperformable0000000001",
        type: "LAB_TEST",
        displayName: "Complete blood count",
      },
    },
  };
}

function makeLabOrderItem(overrides: Record<string, unknown> = {}) {
  return {
    id: TEST_IDS.keptOrderItemId,
    status: LabOrderItemStatus.ORDERED,
    specimens: [],
    performable: {
      id: "cperformable0000000001",
      type: "LAB_TEST",
      displayName: "Complete blood count",
      specimenTypes: [
        {
          isDefault: true,
          specimenType: {
            id: TEST_IDS.specimenTypeId,
            code: "WB",
            displayName: "Whole blood",
          },
        },
      ],
    },
    ...overrides,
  };
}

function makeLabOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: TEST_IDS.labOrderId,
    no: "LO-2601050001",
    status: LabOrderStatus.ORDERED,
    patient: { id: TEST_IDS.patientId },
    items: [
      // Held by the specimen that is being reassigned.
      makeLabOrderItem({
        id: TEST_IDS.keptOrderItemId,
        specimens: [{ endedAt: null, specimen: { id: TEST_IDS.specimenId } }],
      }),
      // Held by the specimen that is being reassigned.
      makeLabOrderItem({
        id: TEST_IDS.droppedOrderItemId,
        specimens: [{ endedAt: null, specimen: { id: TEST_IDS.specimenId } }],
      }),
      // Free, so it can receive the specimen.
      makeLabOrderItem({ id: TEST_IDS.freeOrderItemId }),
      // Held by another specimen.
      makeLabOrderItem({
        id: TEST_IDS.takenOrderItemId,
        specimens: [
          { endedAt: null, specimen: { id: TEST_IDS.freeOrderItemId } },
        ],
      }),
    ],
    ...overrides,
  };
}

function makeSpecimenRow(overrides: Record<string, unknown> = {}) {
  return {
    id: TEST_IDS.specimenId,
    no: "2601050001",
    note: null,
    period: "260105",
    sequence: 1,
    patientId: TEST_IDS.patientId,
    status: SpecimenStatus.COLLECTED,
    rejectionReason: null,
    cancellationReason: null,
    collectedAt,
    collectedById: null,
    collectedBy: null,
    receivedAt: null,
    receivedById: null,
    receivedBy: null,
    rejectedAt: null,
    cancelledAt: null,
    createdAt,
    updatedAt: createdAt,
    orderItems: [
      assignment("assignment_keep", TEST_IDS.keptOrderItemId),
      assignment("assignment_drop", TEST_IDS.droppedOrderItemId),
    ],
    specimenType: {
      id: TEST_IDS.specimenTypeId,
      code: "WB",
      isActive: true,
      displayName: "Whole blood",
    },
    ...overrides,
  };
}

beforeEach(() => {
  transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
    callback({}),
  );
  authenticatedUser.mockResolvedValue(STAFF_USER);
  mockGetLabOrder.mockResolvedValue(makeLabOrder());
  mockGetSpecimen.mockResolvedValue(makeSpecimenRow());
  mockUpdateSpecimen.mockResolvedValue(makeSpecimenRow());
  mockUpdateMany.mockResolvedValue({ count: 1 });
  mockCreateAuditLog.mockResolvedValue({ id: "audit_log_id" });
});

describe("updateSpecimenAction reassignment", () => {
  const reassignTo = (orderItemIds: string[]) =>
    updateSpecimenAction({
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      specimenTypeId: TEST_IDS.specimenTypeId,
      orderItemIds,
    });

  it("refuses an item that another specimen holds", async () => {
    // Without the guard the item would end up with two active specimens, and no
    // rule would say which sample its result belongs to.
    await expect(
      reassignTo([TEST_IDS.keptOrderItemId, TEST_IDS.takenOrderItemId]),
    ).rejects.toThrow("Lab order item already has an active specimen");

    // Nothing is written: the refusal happens before the assignments of this
    // specimen are ended.
    expect(mockUpdateMany).not.toHaveBeenCalled();
    expect(mockUpdateSpecimen).not.toHaveBeenCalled();
    expect(mockCreateAuditLog).not.toHaveBeenCalled();
  });

  it("refuses the conflicting item even when it is the only new one", async () => {
    await expect(reassignTo([TEST_IDS.takenOrderItemId])).rejects.toThrow(
      "Lab order item already has an active specimen",
    );
    expect(mockUpdateMany).not.toHaveBeenCalled();
    expect(mockUpdateSpecimen).not.toHaveBeenCalled();
  });

  it("keeps reassigning to the items the specimen already holds", async () => {
    // The items of the specimen itself are not a conflict: they keep their
    // active assignment.
    await expect(
      reassignTo([
        TEST_IDS.keptOrderItemId,
        TEST_IDS.droppedOrderItemId,
        TEST_IDS.freeOrderItemId,
      ]),
    ).resolves.toBeDefined();

    expect(mockUpdateSpecimen).toHaveBeenCalledWith(expect.anything(), {
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      specimenTypeId: TEST_IDS.specimenTypeId,
      laboratoryId: TEST_IDS.laboratoryId,
      // Only the free item is created, so the kept assignments stay untouched.
      orderItemIds: [TEST_IDS.freeOrderItemId],
    });
  });

  it("ends the dropped assignments instead of deleting them", async () => {
    await reassignTo([TEST_IDS.keptOrderItemId, TEST_IDS.freeOrderItemId]);

    expect(mockUpdateMany).toHaveBeenCalledWith(expect.anything(), {
      endedAt: expect.any(Date),
      endReason: SpecimenAssignmentEndReason.REASSIGNED,
      onlyActive: true,
      specimenId: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      excludedLabOrderItemIds: [TEST_IDS.keptOrderItemId],
    });
    expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.anything(), {
      action: "SPECIMEN_REASSIGNED",
      actorId: TEST_IDS.actorId,
      entityId: TEST_IDS.specimenId,
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId: TEST_IDS.laboratoryId,
      metadata: {
        endedLabOrderItemSpecimenIds: ["assignment_drop"],
        createdLabOrderItemSpecimenIds: [],
      },
    });
  });

  it("accepts an item whose earlier assignment to this specimen ended", async () => {
    // A previous reassignment ended the assignment, so the item is free again
    // and history is never mutated to move the specimen back.
    mockGetSpecimen.mockResolvedValue(
      makeSpecimenRow({
        orderItems: [
          assignment("assignment_keep", TEST_IDS.keptOrderItemId),
          assignment("assignment_history", TEST_IDS.freeOrderItemId, createdAt),
        ],
      }),
    );

    await reassignTo([TEST_IDS.keptOrderItemId, TEST_IDS.freeOrderItemId]);

    expect(mockUpdateSpecimen).toHaveBeenCalledWith(expect.anything(), {
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      specimenTypeId: TEST_IDS.specimenTypeId,
      laboratoryId: TEST_IDS.laboratoryId,
      orderItemIds: [TEST_IDS.freeOrderItemId],
    });
  });
});
