import {
  AuditLogEntityType,
  LabOrderItemStatus,
  LabOrderStatus,
  Role,
  SpecimenStatus,
} from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import { createAuditLog } from "@/features/audit-log/audit-log.service";
import { getLabOrder } from "@/features/lab-order/lab-order.service";
import { updateManyLabOrderItemSpecimen } from "@/features/lab-order-item-specimen/lab-order-item-specimen.service";
import {
  collectSpecimen,
  createSpecimen,
  getSpecimen,
  receiveSpecimen,
  reserveSpecimenNo,
  reuseSpecimen,
  updateSpecimen,
} from "../specimen.service";
import { reuseSpecimenAction } from "../specimen.action";

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
// An assignment happens inside one order, so the action reads that order alone
// instead of every order of the patient.
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
  reuseSpecimen: jest.fn(),
  reserveSpecimenNo: jest.fn(),
}));

const transaction = (prisma as unknown as { $transaction: jest.Mock })
  .$transaction;
const authenticatedUser = ensureUserAuthenticated as jest.Mock;
const mockCreateAuditLog = createAuditLog as jest.Mock;
const mockGetLabOrder = getLabOrder as jest.Mock;
const mockUpdateMany = updateManyLabOrderItemSpecimen as jest.Mock;
const mockCollectSpecimen = collectSpecimen as jest.Mock;
const mockCreateSpecimen = createSpecimen as jest.Mock;
const mockGetSpecimen = getSpecimen as jest.Mock;
const mockReceiveSpecimen = receiveSpecimen as jest.Mock;
const mockReuseSpecimen = reuseSpecimen as jest.Mock;
const mockReserveSpecimenNo = reserveSpecimenNo as jest.Mock;
const mockUpdateSpecimen = updateSpecimen as jest.Mock;

const TEST_IDS = {
  actorId: "tz4a98xxat96iws9zmbrgj3a",
  specimenId: "ckqp6y6q50000qzrm8b1v3f7d",
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
  labOrderId: "cm9z8y7x6w5v4u3t2s1r0qpo",
  otherLabOrderId: "cz1x2c3v4b5n6m7q8w9e0r1t",
  orderItemId: "c9wq3x1v70000qzrm5t2h8k4d",
  otherOrderItemId: "c1b2n3m4k5j6h7g8f9d0s1a2",
  newOrderItemId: "cb2n3m4k5j6h7g8f9d0s1a2q",
  specimenTypeId: "cv4b5n6m7q8w9e0r1t2y3u4i",
  otherSpecimenTypeId: "cw5c6v7b8n9m0q1w2e3r4t5y",
  patientId: "ca1s2d3f4g5h6j7k8l9z0x1c2",
  otherPatientId: "cc3m4n5b6v7c8x9z0l1k2j3h",
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

function makeOrderItem(overrides: Record<string, unknown> = {}) {
  return {
    id: TEST_IDS.orderItemId,
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
    items: [makeOrderItem(), makeOrderItem({ id: TEST_IDS.otherOrderItemId })],
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
    orderItems: [],
    specimenType: {
      id: TEST_IDS.specimenTypeId,
      code: "WB",
      isActive: true,
      displayName: "Whole blood",
    },
    ...overrides,
  };
}

/**
 * The payload names the order the assignment is made in plus the tests of that
 * order the specimen should cover. The specimen itself may come from any order
 * of its patient, because the sample belongs to the patient.
 */
const reuseParams = {
  id: TEST_IDS.specimenId,
  labOrderId: TEST_IDS.labOrderId,
  orderItemIds: [TEST_IDS.orderItemId],
};

beforeEach(() => {
  transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
    callback({}),
  );
  authenticatedUser.mockResolvedValue(STAFF_USER);
  mockGetLabOrder.mockResolvedValue(makeLabOrder());
  mockGetSpecimen.mockResolvedValue(makeSpecimenRow());
  mockReuseSpecimen.mockResolvedValue(makeSpecimenRow());
  mockUpdateMany.mockResolvedValue({ count: 1 });
  mockCreateAuditLog.mockResolvedValue({ id: "audit_log_id" });
});

describe("reuseSpecimenAction", () => {
  it("refuses a role without the update permission", async () => {
    authenticatedUser.mockResolvedValue({ ...STAFF_USER, role: Role.DOCTOR });

    await expect(reuseSpecimenAction(reuseParams)).rejects.toMatchObject({
      name: "UnauthorizedError",
      code: "UNAUTHORIZED",
      message: "You don't have permission to reuse a specimen.",
    });
    expect(transaction).not.toHaveBeenCalled();
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a specimen that does not exist in the caller's laboratory", async () => {
    mockGetSpecimen.mockResolvedValue(null);

    await expect(reuseSpecimenAction(reuseParams)).rejects.toThrow(
      "Specimen not found",
    );
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
  });

  it.each([SpecimenStatus.CANCELLED, SpecimenStatus.REJECTED])(
    "refuses a %s specimen",
    async (status) => {
      mockGetSpecimen.mockResolvedValue(makeSpecimenRow({ status }));

      await expect(reuseSpecimenAction(reuseParams)).rejects.toThrow(
        "Specimen is not editable",
      );
      expect(mockReuseSpecimen).not.toHaveBeenCalled();
    },
  );

  it("reads the order of the payload in the caller's laboratory", async () => {
    await reuseSpecimenAction(reuseParams);

    expect(mockGetLabOrder).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: TEST_IDS.labOrderId,
        laboratoryId: TEST_IDS.laboratoryId,
      }),
    );
  });

  it("refuses a lab order that does not exist in the caller's laboratory", async () => {
    mockGetLabOrder.mockResolvedValue(null);

    await expect(reuseSpecimenAction(reuseParams)).rejects.toThrow(
      "Lab order not found",
    );
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
  });

  it.each([LabOrderStatus.COMPLETED, LabOrderStatus.CANCELLED])(
    "refuses a %s order",
    async (status) => {
      mockGetLabOrder.mockResolvedValue(makeLabOrder({ status }));

      await expect(reuseSpecimenAction(reuseParams)).rejects.toThrow(
        "This lab order can no longer be changed",
      );
      expect(mockReuseSpecimen).not.toHaveBeenCalled();
    },
  );

  // The order is named by the payload, so an order of another patient can only
  // arrive through a stale or tampered payload.
  it("refuses a lab order of another patient", async () => {
    mockGetLabOrder.mockResolvedValue(
      makeLabOrder({ patient: { id: TEST_IDS.otherPatientId } }),
    );

    await expect(reuseSpecimenAction(reuseParams)).rejects.toThrow(
      "The specimen belongs to another patient",
    );
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
    expect(mockCreateAuditLog).not.toHaveBeenCalled();
  });

  it("refuses a test that is not part of the order", async () => {
    await expect(
      reuseSpecimenAction({
        ...reuseParams,
        orderItemIds: [TEST_IDS.newOrderItemId],
      }),
    ).rejects.toThrow("Lab order item is not part of this lab order");
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
  });

  // The tests of another order of the same patient are not part of this one:
  // they are assigned from the screen of their own order.
  it("refuses a test of another order of the same patient", async () => {
    await expect(
      reuseSpecimenAction({
        ...reuseParams,
        orderItemIds: [TEST_IDS.orderItemId, TEST_IDS.newOrderItemId],
      }),
    ).rejects.toThrow("Lab order item is not part of this lab order");
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
  });

  it("refuses the same test twice", async () => {
    await expect(
      reuseSpecimenAction({
        ...reuseParams,
        orderItemIds: [TEST_IDS.orderItemId, TEST_IDS.orderItemId],
      }),
    ).rejects.toThrow("A lab order item can only be selected once");
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a test that already carries an active specimen", async () => {
    mockGetLabOrder.mockResolvedValue(
      makeLabOrder({
        items: [
          makeOrderItem({
            specimens: [
              {
                endedAt: null,
                specimen: { id: TEST_IDS.newOrderItemId },
              },
            ],
          }),
        ],
      }),
    );

    await expect(reuseSpecimenAction(reuseParams)).rejects.toThrow(
      "This test already has a specimen assigned",
    );
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
    expect(mockCreateAuditLog).not.toHaveBeenCalled();
  });

  it("accepts a test whose previous assignment ended", async () => {
    mockGetLabOrder.mockResolvedValue(
      makeLabOrder({
        items: [
          makeOrderItem({
            specimens: [
              {
                endedAt: new Date("2026-01-04T09:00:00.000Z"),
                specimen: { id: TEST_IDS.newOrderItemId },
              },
            ],
          }),
        ],
      }),
    );

    await reuseSpecimenAction(reuseParams);

    expect(mockReuseSpecimen).toHaveBeenCalledWith(expect.anything(), {
      id: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      orderItemIds: [TEST_IDS.orderItemId],
    });
  });

  it("refuses a test that is no longer ordered", async () => {
    mockGetLabOrder.mockResolvedValue(
      makeLabOrder({
        items: [makeOrderItem({ status: LabOrderItemStatus.IN_PROCESS })],
      }),
    );

    await expect(reuseSpecimenAction(reuseParams)).rejects.toThrow(
      "This test is no longer ordered, so it cannot receive a specimen",
    );
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
  });

  it("refuses a test of an incompatible specimen type", async () => {
    mockGetLabOrder.mockResolvedValue(
      makeLabOrder({
        items: [
          makeOrderItem({
            performable: {
              id: "cperformable0000000002",
              type: "LAB_TEST",
              displayName: "Urinalysis",
              specimenTypes: [
                {
                  isDefault: true,
                  specimenType: { id: TEST_IDS.otherSpecimenTypeId },
                },
              ],
            },
          }),
        ],
      }),
    );

    await expect(reuseSpecimenAction(reuseParams)).rejects.toThrow(
      "This specimen type does not match what the test requires",
    );
    expect(mockReuseSpecimen).not.toHaveBeenCalled();
  });

  it("assigns the specimen to the tests of an in-process order without writing anything else", async () => {
    // An order that already started keeps taking new tests as long as they were
    // not started themselves, so an assignment works there too.
    mockGetLabOrder.mockResolvedValue(
      makeLabOrder({
        status: LabOrderStatus.IN_PROCESS,
        items: [
          makeOrderItem({ id: TEST_IDS.orderItemId }),
          makeOrderItem({ id: TEST_IDS.otherOrderItemId }),
        ],
      }),
    );

    await reuseSpecimenAction({
      ...reuseParams,
      orderItemIds: [TEST_IDS.orderItemId, TEST_IDS.otherOrderItemId],
    });

    expect(mockReuseSpecimen).toHaveBeenCalledWith(expect.anything(), {
      id: TEST_IDS.specimenId,
      laboratoryId: TEST_IDS.laboratoryId,
      orderItemIds: [TEST_IDS.orderItemId, TEST_IDS.otherOrderItemId],
    });
    // The assignment is append-only: the specimen itself is never updated and
    // the existing assignments are never ended.
    expect(mockUpdateSpecimen).not.toHaveBeenCalled();
    expect(mockCollectSpecimen).not.toHaveBeenCalled();
    expect(mockReceiveSpecimen).not.toHaveBeenCalled();
    expect(mockUpdateMany).not.toHaveBeenCalled();
    expect(mockCreateSpecimen).not.toHaveBeenCalled();
    expect(mockReserveSpecimenNo).not.toHaveBeenCalled();
  });

  it("logs the order and the tests it received in the audit log", async () => {
    await reuseSpecimenAction({
      ...reuseParams,
      orderItemIds: [TEST_IDS.orderItemId, TEST_IDS.otherOrderItemId],
    });

    expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.anything(), {
      action: "SPECIMEN_REUSED",
      actorId: TEST_IDS.actorId,
      entityId: TEST_IDS.specimenId,
      entityType: AuditLogEntityType.SPECIMEN,
      laboratoryId: TEST_IDS.laboratoryId,
      metadata: {
        reusedLabOrders: [
          {
            id: TEST_IDS.labOrderId,
            no: "LO-2601050001",
            itemIds: [TEST_IDS.orderItemId, TEST_IDS.otherOrderItemId],
          },
        ],
        reusedLabOrderItemIds: [
          TEST_IDS.orderItemId,
          TEST_IDS.otherOrderItemId,
        ],
        reusedPerformableNames: [
          "Complete blood count",
          "Complete blood count",
        ],
      },
    });
  });

  it("records only the requested tests in the audit log", async () => {
    await reuseSpecimenAction(reuseParams);

    expect(mockCreateAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        metadata: {
          reusedLabOrders: [
            {
              id: TEST_IDS.labOrderId,
              no: "LO-2601050001",
              itemIds: [TEST_IDS.orderItemId],
            },
          ],
          reusedLabOrderItemIds: [TEST_IDS.orderItemId],
          reusedPerformableNames: ["Complete blood count"],
        },
      }),
    );
  });

  it("serializes the reused specimen for the client", async () => {
    const result = await reuseSpecimenAction(reuseParams);

    expect(result.data).toMatchObject({
      id: TEST_IDS.specimenId,
      patientId: TEST_IDS.patientId,
      status: SpecimenStatus.COLLECTED,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      collectedAt: collectedAt.toISOString(),
      receivedAt: undefined,
    });
  });
});
