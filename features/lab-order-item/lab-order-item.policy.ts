import { LabOrderItemStatus } from "@/generated/prisma";

export function ensureLabOrderItemHasNoActiveSpecimen(labOrderItem: {
  specimens: { endedAt: Date | null }[];
}) {
  if (hasActiveSpecimenAssignment(labOrderItem)) {
    throw new Error("Lab order item already has an active specimen");
  }
}

/**
 * An order item counts as assigned while at least one of its specimen
 * assignments has not ended, i.e. while a relation still has a null `endedAt`.
 * Ending the assignment (reassign, cancel, reject) is what makes the item
 * assignable again.
 *
 * `endedAt` also accepts a serialized date, so the very same rule backs the
 * server checks and the client views that read the serialized lab order.
 */
export function hasActiveSpecimenAssignment(labOrderItem: {
  specimens: { endedAt?: Date | string | null }[];
}) {
  return labOrderItem.specimens.some(({ endedAt }) => !endedAt);
}

/** An order item together with the specimen assignments loaded for it. */
type LabOrderItemWithSpecimenAssignments = {
  status: LabOrderItemStatus;
  specimens: { endedAt?: Date | string | null }[];
};

/**
 * The order items that still need a specimen. Cancelled items are exempt, the
 * same way the assignment worklist leaves them out of its progress and its
 * assignment queue.
 */
export function getUnassignedLabOrderItems<
  T extends LabOrderItemWithSpecimenAssignments,
>(items: T[]) {
  return items.filter(
    (item) =>
      item.status !== LabOrderItemStatus.CANCELLED &&
      !hasActiveSpecimenAssignment(item),
  );
}

/**
 * Whether every eligible item of the order is attached to an active specimen.
 * An order without any eligible item counts as assigned: there is nothing left
 * to assign, so nothing can be missed.
 */
export function isLabOrderFullyAssigned(
  items: LabOrderItemWithSpecimenAssignments[],
) {
  return getUnassignedLabOrderItems(items).length === 0;
}

/**
 * A collection may only start once every eligible item of the whole order is
 * attached to an active specimen, not only the items of the specimen being
 * collected: the labels printed after assignment are what tie a physical sample
 * to its tests, so a sample must never be collected for a partial order.
 */
export function ensureLabOrderItemsAreAssignedToSpecimens(
  items: LabOrderItemWithSpecimenAssignments[],
) {
  if (!isLabOrderFullyAssigned(items)) {
    throw new Error(
      "Every lab order item must be assigned to an active specimen before collection",
    );
  }
}
