import crypto from "crypto";
import {
  IntegrationEventType,
  LabOrderPriority,
  LabOrderStatus,
  PatientSex,
} from "@/generated/prisma";

/**
 * A realistic `POST /api/integration/his/lab-order` body.
 *
 * The identifiers are stable so a test can assert on them; only the message id
 * and idempotency key are random, because those are what the route uses to
 * decide that a delivery is a replay and two suites must not collide on the
 * event table's uniqueness constraint.
 */
export const HIS_LAB_ORDER_TEST_IDS = {
  patientExternalId: "PAT-1001",
  patientName: "Ada Lovelace",
  encounterId: "ENC-2001",
  encounterNo: "ENC-2001-NO",
  orderingProviderId: "PROV-3001",
  orderExternalId: "ORDER-4001",
  orderNo: "HIS-ORDER-4001",
  orderableExternalId: "EXT-CBC",
  itemExternalId: "ITEM-5001",
} as const;

export type HisLabOrderItemPayload = {
  id: string;
  sortOrder: number;
  orderableId: string;
  note?: string;
  status?: string;
  priority?: LabOrderPriority;
};

export type HisLabOrderPayload = {
  messageId: string;
  idempotencyKey: string;
  eventType: IntegrationEventType;
  patient: {
    id: string;
    name: string;
    sex: PatientSex;
    mrn?: string;
    dateOfBirth: string;
  };
  encounter: { id: string; no: string; type: string; status: string };
  orderingProvider: { id: string; name: string };
  order: {
    id: string;
    no: string;
    status?: LabOrderStatus;
    priority?: LabOrderPriority;
    orderedAt: string;
    sourceSystem: string;
  };
  items: HisLabOrderItemPayload[];
};

export function makeHisLabOrderItem(
  overrides: Partial<HisLabOrderItemPayload> = {},
): HisLabOrderItemPayload {
  return {
    id: HIS_LAB_ORDER_TEST_IDS.itemExternalId,
    sortOrder: 0,
    orderableId: HIS_LAB_ORDER_TEST_IDS.orderableExternalId,
    priority: LabOrderPriority.ROUTINE,
    ...overrides,
  };
}

export function makeHisLabOrderPayload({
  items,
  patient,
  encounter,
  orderingProvider,
  order,
  ...overrides
}: {
  items?: HisLabOrderItemPayload[];
  messageId?: string;
  idempotencyKey?: string;
  eventType?: IntegrationEventType;
  patient?: Partial<HisLabOrderPayload["patient"]>;
  encounter?: Partial<HisLabOrderPayload["encounter"]>;
  orderingProvider?: Partial<HisLabOrderPayload["orderingProvider"]>;
  order?: Partial<HisLabOrderPayload["order"]>;
} = {}): HisLabOrderPayload {
  const ids = HIS_LAB_ORDER_TEST_IDS;

  return {
    messageId: `msg_${crypto.randomUUID()}`,
    idempotencyKey: `idem_${crypto.randomUUID()}`,
    eventType: IntegrationEventType.CLINICAL_ORDER_CREATED,
    patient: {
      id: ids.patientExternalId,
      name: ids.patientName,
      sex: PatientSex.FEMALE,
      mrn: "MRN-1001",
      dateOfBirth: "1990-01-01T00:00:00.000Z",
      ...patient,
    },
    encounter: {
      id: ids.encounterId,
      no: ids.encounterNo,
      type: "OUTPATIENT",
      status: "ACTIVE",
      ...encounter,
    },
    orderingProvider: {
      id: ids.orderingProviderId,
      name: "Dr. Grace Hopper",
      ...orderingProvider,
    },
    order: {
      id: ids.orderExternalId,
      no: ids.orderNo,
      status: LabOrderStatus.ORDERED,
      priority: LabOrderPriority.ROUTINE,
      orderedAt: "2026-01-05T08:00:00.000Z",
      sourceSystem: "HIS",
      ...order,
    },
    items: items ?? [makeHisLabOrderItem()],
    ...overrides,
  };
}
