import {
  AuditLogEntityType,
  LabOrderStatus,
  Role,
  SpecimenAssignmentEndReason,
  SpecimenStatus,
} from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { UnauthenticatedError } from "@/lib/custom-errors/unauthenticated-error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import { createAuditLog } from "@/features/audit-log/audit-log.service";
import { getLabOrder } from "@/features/lab-order/lab-order.service";
import { getSpecimenPersonnelCandidate } from "@/features/user/user.service";
import { updateManyLabOrderItemSpecimen } from "@/features/lab-order-item-specimen/lab-order-item-specimen.service";
import {
  collectSpecimen,
  createSpecimen,
  getSpecimen,
  receiveSpecimen,
  reserveSpecimenNo,
  updateSpecimen,
} from "../specimen.service";
import {
  collectSpecimenAction,
  createSpecimenAction,
  getSpecimenAction,
  getSpecimenPersonnelCandidatesAction,
  receiveSpecimenAction,
  updateSpecimenAction,
} from "../specimen.action";

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

const transaction = (prisma as unknown as { $transaction: jest.Mock })
  .$transaction;
const authenticatedUser = ensureUserAuthenticated as jest.Mock;
const mockCreateAuditLog = createAuditLog as jest.Mock;
const mockGetLabOrder = getLabOrder as jest.Mock;
const mockGetPersonnelCandidate = getSpecimenPersonnelCandidate as jest.Mock;
const mockUpdateMany = updateManyLabOrderItemSpecimen as jest.Mock;
const mockCollectSpecimen = collectSpecimen as jest.Mock;
const mockCreateSpecimen = createSpecimen as jest.Mock;
const mockGetSpecimen = getSpecimen as jest.Mock;
const mockReceiveSpecimen = receiveSpecimen as jest.Mock;
const mockReserveSpecimenNo = reserveSpecimenNo as jest.Mock;
const mockUpdateSpecimen = updateSpecimen as jest.Mock;

const TEST_IDS = {
  actorId: "tz4a98xxat96iws9zmbrgj3a",
  specimenId: "ckqp6y6q50000qzrm8b1v3f7d",
  laboratoryId: "clx1a2b3c4d5e6f7g8h9i0jk",
  labOrderId: "cm9z8y7x6w5v4u3t2s1r0qpo",
  orderItemId: "c9wq3x1v70000qzrm5t2h8k4d",
  otherOrderItemId: "c1b2n3m4k5j6h7g8f9d0s1a2",
  newOrderItemId: "cz1x2c3v4b5n6m7q8w9e0r1t",
  specimenTypeId: "cv4b5n6m7q8w9e0r1t2y3u4i",
  patientId: "ca1s2d3f4g5h6j7k8l9z0x1c2",
  collectorId: "cb2n3m4k5j6h7g8f9d0s1a2q",
  receiverId: "cc3m4n5b6v7c8x9z0l1k2j3h",
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
    items: [
      { id: TEST_IDS.orderItemId, specimens: [] },
      { id: TEST_IDS.otherOrderItemId, specimens: [] },
    ],
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
    specimenType: { id: TEST_IDS.specimenTypeId, name: "Whole blood" },
    ...overrides,
  };
}

const createParams = {
  patientId: TEST_IDS.patientId,
  labOrderId: TEST_IDS.labOrderId,
  orderItemIds: [TEST_IDS.orderItemId],
  specimenTypeId: TEST_IDS.specimenTypeId,
};

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
  mockGetLabOrder.mockResolvedValue(makeLabOrder());
  mockGetSpecimen.mockResolvedValue(makeSpecimenRow());
  mockGetPersonnelCandidate.mockResolvedValue({
    id: TEST_IDS.collectorId,
    name: "Collector",
    username: "collector",
  });
  mockReserveSpecimenNo.mockResolvedValue({
    no: "2601050001",
    period: "260105",
    sequence: 1,
  });
  mockCreateSpecimen.mockResolvedValue(makeSpecimenRow());
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

describe("authorization", () => {
  const deniedCases: Array<[string, Role, () => Promise<unknown>, string]> = [
    [
      "createSpecimenAction",
      Role.LAB_ADMIN,
      () => createSpecimenAction(createParams),
      "create a specimen",
    ],
    [
      "getSpecimenAction",
      Role.SYS_ADMIN,
      () => getSpecimenAction({ id: TEST_IDS.specimenId }),
      "view this specimen",
    ],
    [
      "updateSpecimenAction",
      Role.DOCTOR,
      () =>
        updateSpecimenAction({
          id: TEST_IDS.specimenId,
          labOrderId: TEST_IDS.labOrderId,
        }),
      "update this specimen",
    ],
    [
      "collectSpecimenAction",
      Role.LAB_ADMIN,
      () => collectSpecimenAction(collectParams),
      "collect this specimen",
    ],
    [
      "receiveSpecimenAction",
      Role.DOCTOR,
      () => receiveSpecimenAction(receiveParams),
      "receive this specimen",
    ],
    [
      "getSpecimenPersonnelCandidatesAction",
      Role.LAB_ADMIN,
      () => getSpecimenPersonnelCandidatesAction(),
      "view specimen personnel",
    ],
  ];

  it.each(deniedCases)(
    "%s refuses a role without the permission",
    async (_action, role, run, message) => {
      authenticatedUser.mockResolvedValue({ ...STAFF_USER, role });

      await expect(run()).rejects.toMatchObject({
        name: "UnauthorizedError",
        code: "UNAUTHORIZED",
        statusCode: 422,
        message: `You don't have permission to ${message}.`,
      });
      // Nothing may be read or written before the permission is checked.
      expect(transaction).not.toHaveBeenCalled();
      expect(mockGetLabOrder).not.toHaveBeenCalled();
      expect(mockCreateAuditLog).not.toHaveBeenCalled();
    },
  );

  it("stops an unauthenticated caller before touching any data", async () => {
    authenticatedUser.mockRejectedValue(new UnauthenticatedError());

    await expect(createSpecimenAction(createParams)).rejects.toMatchObject({
      name: "UnauthenticatedError",
      message: "Unauthenticated.",
    });
    expect(transaction).not.toHaveBeenCalled();
  });

  describe("createSpecimenAction", () => {
    it("refuses an order that does not exist in the caller's laboratory", async () => {
      mockGetLabOrder.mockResolvedValue(null);

      await expect(createSpecimenAction(createParams)).rejects.toThrow(
        "Order is not found",
      );
      expect(mockReserveSpecimenNo).not.toHaveBeenCalled();
      expect(mockCreateSpecimen).not.toHaveBeenCalled();
    });

    it("refuses a completed order", async () => {
      mockGetLabOrder.mockResolvedValue(
        makeLabOrder({ status: LabOrderStatus.COMPLETED }),
      );

      await expect(createSpecimenAction(createParams)).rejects.toThrow(
        "Lab order is not editable",
      );
      expect(mockCreateSpecimen).not.toHaveBeenCalled();
    });

    it("refuses a selected order item that already carries an active specimen", async () => {
      mockGetLabOrder.mockResolvedValue(
        makeLabOrder({
          items: [
            { id: TEST_IDS.orderItemId, specimens: [{ endedAt: null }] },
            { id: TEST_IDS.otherOrderItemId, specimens: [] },
          ],
        }),
      );

      await expect(createSpecimenAction(createParams)).rejects.toThrow(
        "Lab order item already has an active specimen",
      );
      expect(mockReserveSpecimenNo).not.toHaveBeenCalled();
    });

    it("ignores the order items the caller did not select", async () => {
      mockGetLabOrder.mockResolvedValue(
        makeLabOrder({
          items: [
            { id: TEST_IDS.orderItemId, specimens: [] },
            { id: TEST_IDS.otherOrderItemId, specimens: [{ endedAt: null }] },
          ],
        }),
      );

      await expect(createSpecimenAction(createParams)).resolves.toBeDefined();
      expect(mockCreateSpecimen).toHaveBeenCalledTimes(1);
    });

    it("reserves the next number in the caller's laboratory and audits the creation", async () => {
      const result = await createSpecimenAction(createParams);

      expect(mockReserveSpecimenNo).toHaveBeenCalledWith(expect.anything(), {
        date: expect.any(Date),
      });
      expect(mockCreateSpecimen).toHaveBeenCalledWith(expect.anything(), {
        ...createParams,
        laboratoryId: TEST_IDS.laboratoryId,
        no: "2601050001",
        period: "260105",
        sequence: 1,
      });
      expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.anything(), {
        action: "SPECIMEN_CREATED",
        actorId: TEST_IDS.actorId,
        entityId: TEST_IDS.specimenId,
        entityType: AuditLogEntityType.SPECIMEN,
        laboratoryId: TEST_IDS.laboratoryId,
      });
      expect(result.data).toMatchObject({
        id: TEST_IDS.specimenId,
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
        // `serializeSpecimen` maps an absent date through `?.toISOString()`, so a
        // specimen without a collection time serialises as `undefined`, not `null`.
        collectedAt: undefined,
      });
    });

    it("avoids writing an audit log when the specimen cannot be created", async () => {
      mockCreateSpecimen.mockRejectedValue(new Error("duplicate specimen no."));

      await expect(createSpecimenAction(createParams)).rejects.toThrow(
        "duplicate specimen no.",
      );
      expect(mockCreateAuditLog).not.toHaveBeenCalled();
    });
  });

  describe("getSpecimenAction", () => {
    it("scopes the lookup to the caller's laboratory and serialises the dates", async () => {
      mockGetSpecimen.mockResolvedValue(
        makeSpecimenRow({
          status: SpecimenStatus.RECEIVED,
          collectedAt,
          receivedAt,
          orderItems: [
            {
              id: "lab_order_item_specimen_1",
              endedAt: null,
              endReason: null,
              assignedAt: createdAt,
              labOrderItem: { id: TEST_IDS.orderItemId },
            },
          ],
        }),
      );

      const { data } = await getSpecimenAction({ id: TEST_IDS.specimenId });

      expect(mockGetSpecimen).toHaveBeenCalledWith(expect.anything(), {
        id: TEST_IDS.specimenId,
        laboratoryId: TEST_IDS.laboratoryId,
      });
      expect(data).toMatchObject({
        id: TEST_IDS.specimenId,
        collectedAt: collectedAt.toISOString(),
        receivedAt: receivedAt.toISOString(),
        // Absent dates serialise as `undefined` because the serializer uses
        // `?.toISOString()` instead of a `null` passthrough.
        rejectedAt: undefined,
        cancelledAt: undefined,
        orderItems: [
          {
            id: "lab_order_item_specimen_1",
            assignedAt: createdAt.toISOString(),
            endedAt: undefined,
          },
        ],
      });
    });

    it("returns no data when the specimen is not in the caller's laboratory", async () => {
      mockGetSpecimen.mockResolvedValue(null);

      await expect(
        getSpecimenAction({ id: TEST_IDS.specimenId }),
      ).resolves.toEqual({ data: null });
    });
  });

  describe("updateSpecimenAction", () => {
    const assignment = (
      id: string,
      labOrderItemId: string,
      endedAt: Date | null = null,
    ) => ({
      id,
      endedAt,
      endReason: null,
      assignedAt: createdAt,
      labOrderItem: { id: labOrderItemId },
    });

    const reassignmentParams = {
      id: TEST_IDS.specimenId,
      labOrderId: TEST_IDS.labOrderId,
      orderItemIds: [TEST_IDS.orderItemId, TEST_IDS.newOrderItemId],
      specimenTypeId: TEST_IDS.specimenTypeId,
    };

    it("refuses an order that is no longer editable", async () => {
      mockGetLabOrder.mockResolvedValue(
        makeLabOrder({ status: LabOrderStatus.CANCELLED }),
      );

      await expect(
        updateSpecimenAction({
          id: TEST_IDS.specimenId,
          labOrderId: TEST_IDS.labOrderId,
          note: "lipemic",
        }),
      ).rejects.toThrow("Lab order is not editable");
      expect(mockUpdateSpecimen).not.toHaveBeenCalled();
    });

    it("refuses a specimen that does not exist", async () => {
      mockGetSpecimen.mockResolvedValue(null);

      await expect(
        updateSpecimenAction({
          id: TEST_IDS.specimenId,
          labOrderId: TEST_IDS.labOrderId,
          note: "lipemic",
        }),
      ).rejects.toThrow("Specimen is not found");
    });

    it("refuses a cancelled specimen", async () => {
      mockGetSpecimen.mockResolvedValue(
        makeSpecimenRow({ status: SpecimenStatus.CANCELLED }),
      );

      await expect(
        updateSpecimenAction({
          id: TEST_IDS.specimenId,
          labOrderId: TEST_IDS.labOrderId,
          note: "lipemic",
        }),
      ).rejects.toThrow("Specimen is not editable");
      expect(mockUpdateSpecimen).not.toHaveBeenCalled();
    });

    it("updates a plain field without touching assignments or the audit log", async () => {
      const params = {
        id: TEST_IDS.specimenId,
        labOrderId: TEST_IDS.labOrderId,
        note: "Slightly haemolysed",
      };

      await updateSpecimenAction(params);

      expect(mockUpdateSpecimen).toHaveBeenCalledWith(expect.anything(), {
        ...params,
        laboratoryId: TEST_IDS.laboratoryId,
      });
      expect(mockUpdateMany).not.toHaveBeenCalled();
      expect(mockCreateAuditLog).not.toHaveBeenCalled();
    });

    it("ends the dropped assignments, keeps the current ones and creates the new ones", async () => {
      mockGetSpecimen.mockResolvedValue(
        makeSpecimenRow({
          status: SpecimenStatus.COLLECTED,
          collectedAt,
          orderItems: [
            assignment("assignment_keep", TEST_IDS.orderItemId),
            assignment("assignment_end", TEST_IDS.otherOrderItemId),
            assignment(
              "assignment_history",
              TEST_IDS.newOrderItemId,
              createdAt,
            ),
          ],
        }),
      );
      mockUpdateSpecimen.mockResolvedValue(
        makeSpecimenRow({
          status: SpecimenStatus.COLLECTED,
          collectedAt,
          orderItems: [
            assignment("assignment_keep", TEST_IDS.orderItemId),
            assignment("assignment_created", TEST_IDS.newOrderItemId),
          ],
        }),
      );

      await updateSpecimenAction(reassignmentParams);

      expect(mockUpdateMany).toHaveBeenCalledWith(expect.anything(), {
        endedAt: expect.any(Date),
        endReason: SpecimenAssignmentEndReason.REASSIGNED,
        onlyActive: true,
        specimenId: TEST_IDS.specimenId,
        laboratoryId: TEST_IDS.laboratoryId,
        excludedLabOrderItemIds: [
          TEST_IDS.orderItemId,
          TEST_IDS.newOrderItemId,
        ],
      });
      expect(mockUpdateSpecimen).toHaveBeenCalledWith(expect.anything(), {
        ...reassignmentParams,
        laboratoryId: TEST_IDS.laboratoryId,
        // The item that already has an active assignment is not recreated.
        orderItemIds: [TEST_IDS.newOrderItemId],
      });
      expect(mockCreateAuditLog).toHaveBeenCalledWith(expect.anything(), {
        action: "SPECIMEN_REASSIGNED",
        actorId: TEST_IDS.actorId,
        entityId: TEST_IDS.specimenId,
        entityType: AuditLogEntityType.SPECIMEN,
        laboratoryId: TEST_IDS.laboratoryId,
        metadata: {
          endedLabOrderItemSpecimenIds: ["assignment_end"],
          createdLabOrderItemSpecimenIds: ["assignment_created"],
        },
      });
    });
  });
});
