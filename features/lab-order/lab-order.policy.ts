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
