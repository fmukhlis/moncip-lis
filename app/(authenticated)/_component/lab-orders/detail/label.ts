import {
  LabOrderItemStatus,
  LisPerformableType,
  SpecimenStatus,
} from "@/generated/prisma";

export const PERFORMABLE_TYPE_LABEL = {
  PANEL: "Panel",
  SINGLE: "Test",
} as Record<keyof typeof LisPerformableType, string>;

export const LAB_ORDER_ITEM_STATUS = {
  OPEN: "Open",
  PRINTED: "Printed",
  COLLECTED: "Collected",
  RECEIVED: "Received",
  PRELIMINARY: "Preliminary",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  TNP: "TNP",
  CANCELLED: "Cancelled",
} as Record<keyof typeof LabOrderItemStatus, string>;

export const SPECIMEN_STATUS = {
  PENDING: "Pending",
  COLLECTED: "Collected",
  RECEIVED: "Received",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as Record<keyof typeof SpecimenStatus, string>;
