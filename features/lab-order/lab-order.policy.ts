import { LabOrderStatus } from "@/generated/prisma";

const IMMUTABLE_LAB_ORDER_STATUSES: LabOrderStatus[] = [
  "CANCELLED",
  "COMPLETED",
];

export function isLabOrderEditable(labOrder: { status: LabOrderStatus }) {
  return !IMMUTABLE_LAB_ORDER_STATUSES.includes(labOrder.status);
}

export function ensureLabOrderIsEditable(labOrder: { status: LabOrderStatus }) {
  if (!isLabOrderEditable(labOrder)) {
    throw new Error("Lab order is not editable");
  }
}

/**
 * The status a collection writes to the parent order: an order that has not
 * started yet moves to in process, while an order that already started (or is
 * no longer editable) keeps the status it has, so logging the collection again
 * never moves the order backwards.
 */
export function resolveInProcessStatus(status: LabOrderStatus): LabOrderStatus {
  return status === LabOrderStatus.ORDERED ? LabOrderStatus.IN_PROCESS : status;
}
