import {
  PatientSex,
  LabOrderItemStatus,
  LabOrderPriority,
  SpecimenStatus,
} from "@/generated/prisma";
import { isLabOrderEditable } from "@/features/lab-order/lab-order.policy";
import { getUnassignedLabOrderItems } from "@/features/lab-order-item/lab-order-item.policy";
import type { LabOrder } from "@/features/lab-order/lab-order.type";

/**
 * Pure view helpers for the card worklist.
 *
 * The rows come from the shared lab order list query
 * (`useGetLabOrdersActionQuery`), whose item projection already carries the
 * specimen assignments. These helpers decide which orders belong on the
 * worklist, what a row can do next and how the rows are ordered.
 */

/** A worklist row: a lab order from the shared order list projection. */
export type SpecimenAssignmentOrder = LabOrder;

export type SpecimenAssignmentOrderItem =
  SpecimenAssignmentOrder["items"][number];

/** The work the worklist offers for an order. */
export type WorklistAction = "ASSIGN" | "PRINT_LABEL";

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
 * The distinct specimens currently assigned to the order's items. Several items
 * can share one specimen (one tube covering several tests), so the same specimen
 * may appear more than once and is collapsed here.
 */
export function getAssignedSpecimens(order: SpecimenAssignmentOrder) {
  const specimens = getEligibleItems(order).flatMap((item) => {
    const assignment = getActiveSpecimenAssignment(item);

    return assignment ? [assignment.specimen] : [];
  });

  return [
    ...new Map(specimens.map((specimen) => [specimen.id, specimen])).values(),
  ];
}

const COLLECTED_SPECIMEN_STATUSES: SpecimenStatus[] = [
  SpecimenStatus.COLLECTED,
  SpecimenStatus.RECEIVED,
];

/** Whether any specimen assigned to the order has already been collected. */
export function hasCollectedSpecimen(order: SpecimenAssignmentOrder) {
  return getAssignedSpecimens(order).some(({ status }) =>
    COLLECTED_SPECIMEN_STATUSES.includes(status),
  );
}

/**
 * What the worklist offers for an order, or `null` when the order does not
 * belong on the worklist at all:
 *
 * - `ASSIGN` while at least one non-cancelled item has no active specimen.
 * - `PRINT_LABEL` once every non-cancelled item is assigned and no specimen has
 *   been collected yet, because the labels are printed from this same row.
 * - `null` once a sample exists: the worklist only tracks orders that are still
 *   waiting for assignment or for their labels.
 *
 * The order must still be editable (the same rule `ensureLabOrderIsEditable`
 * enforces) and have a patient, because assigning or labelling is no longer
 * possible and the card renders demographics.
 */
export function getWorklistAction(
  order: SpecimenAssignmentOrder,
): WorklistAction | null {
  if (order.patient == null || !isLabOrderEditable(order)) {
    return null;
  }

  // An order without eligible items has nothing to assign and nothing to label.
  if (!getEligibleItems(order).length) {
    return null;
  }

  // The same rule the backend applies before a collection: an item is assigned
  // only while one of its specimen assignments has not ended.
  if (getUnassignedLabOrderItems(order.items).length) {
    return "ASSIGN";
  }

  return hasCollectedSpecimen(order) ? null : "PRINT_LABEL";
}

export function isWorklistOrder(order: SpecimenAssignmentOrder) {
  return getWorklistAction(order) !== null;
}

/** Lower rank is worked first: STAT, then URGENT, then ROUTINE. */
export const LAB_ORDER_PRIORITY_RANK: Record<LabOrderPriority, number> = {
  [LabOrderPriority.STAT]: 0,
  [LabOrderPriority.URGENT]: 1,
  [LabOrderPriority.ROUTINE]: 2,
};

/**
 * Urgent work first and, within a priority, the order that has been waiting the
 * longest: priority rank ascending, then `orderedAt` ascending.
 */
export function compareWorklistOrders(
  a: SpecimenAssignmentOrder,
  b: SpecimenAssignmentOrder,
) {
  const byPriority =
    LAB_ORDER_PRIORITY_RANK[a.priority] - LAB_ORDER_PRIORITY_RANK[b.priority];

  if (byPriority) {
    return byPriority;
  }

  return new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime();
}
