import { PatientSex, LabOrderItemStatus } from "@/generated/prisma";
import { isLabOrderEditable } from "@/features/lab-order/lab-order.policy";
import type { LabOrder } from "@/features/lab-order/lab-order.type";

/**
 * Pure view helpers for the card worklist.
 *
 * The rows come from the shared lab order list query
 * (`useGetLabOrdersActionQuery`), whose item projection already carries the
 * specimen assignments. These helpers only decide which orders belong on the
 * worklist and how much of a row is assigned.
 */

/** A worklist row: a lab order from the shared order list projection. */
export type SpecimenAssignmentOrder = LabOrder;

export type SpecimenAssignmentOrderItem =
  SpecimenAssignmentOrder["items"][number];

export const PATIENT_SEX_LABEL = {
  MALE: "Male",
  FEMALE: "Female",
  UNKNOWN: "Unknown",
} as Record<keyof typeof PatientSex, string>;

/** The specimen that is currently assigned to an order item, if any. */
export function getActiveSpecimenAssignment(
  item: SpecimenAssignmentOrderItem,
): SpecimenAssignmentOrderItem["specimens"][number] | undefined {
  return item.specimens.find(({ endedAt }) => !endedAt);
}

/** Items that count towards the progress, i.e. cancelled items excluded. */
export function getEligibleItems(
  order: SpecimenAssignmentOrder,
): SpecimenAssignmentOrderItem[] {
  return order.items.filter(
    ({ status }) => status !== LabOrderItemStatus.CANCELLED,
  );
}

export function getOrderProgress(order: SpecimenAssignmentOrder) {
  const eligibleItems = getEligibleItems(order);
  const assigned = eligibleItems.filter((item) =>
    getActiveSpecimenAssignment(item),
  ).length;
  const total = eligibleItems.length;

  return {
    assigned,
    total,
    percentage: total === 0 ? 0 : Math.round((assigned / total) * 100),
  };
}

/**
 * Worklist inclusion: the order must still be editable (the same rule
 * `ensureLabOrderIsEditable` enforces when a specimen is created) and have at
 * least one non-cancelled item without an active specimen. Fully assigned orders
 * are dropped so the worklist never offers an assignment that cannot be made.
 * Orders without a patient are skipped because the card renders demographics.
 */
export function isAssignableOrder(order: SpecimenAssignmentOrder) {
  return (
    order.patient != null &&
    isLabOrderEditable(order) &&
    getEligibleItems(order).some((item) => !getActiveSpecimenAssignment(item))
  );
}
