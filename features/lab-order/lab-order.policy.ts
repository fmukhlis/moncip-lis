import { LabOrderStatus } from "@/generated/prisma";

const IMMUTABLE_LAB_ORDER_STATUSES: LabOrderStatus[] = [
  "CANCELLED",
  "COMPLETED",
];

export function ensureLabOrderIsEditable(labOrder: { status: LabOrderStatus }) {
  if (IMMUTABLE_LAB_ORDER_STATUSES.includes(labOrder.status)) {
    throw new Error("Lab order is not editable");
  }
}
