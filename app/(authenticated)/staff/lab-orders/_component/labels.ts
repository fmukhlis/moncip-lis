import { LabOrderStatus } from "@/generated/prisma";
import { LabOrderPriority } from "@/generated/prisma";

export const STATUS_LABEL = {
  ORDERED: "Ordered",
  IN_PROCESS: "In process",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as Record<keyof typeof LabOrderStatus, string>;

export const PRIORITY_LABEL = {
  ROUTINE: "Routine",
  URGENT: "Urgent",
  STAT: "Stat",
} as Record<keyof typeof LabOrderPriority, string>;
