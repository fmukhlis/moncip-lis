import {
  LabOrderItemStatus,
  LabOrderStatus,
  SpecimenStatus,
} from "@/generated/prisma";
import { isLabOrderEditable } from "../lab-order/lab-order.policy";
import { hasActiveSpecimenAssignment } from "../lab-order-item/lab-order-item.policy";

/**
 * The specimen statuses a specimen can be assigned to new order items from. They
 * are the same statuses `ensureSpecimenIsEditable` allows: a cancelled or
 * rejected specimen carries no sample any more, and its assignments are its
 * history only.
 *
 * Reusing a specimen never writes the status, so a pending specimen stays
 * pending and a collected or received one keeps the sample it already carries.
 */
export const ASSIGNABLE_SPECIMEN_STATUSES: SpecimenStatus[] = [
  SpecimenStatus.PENDING,
  SpecimenStatus.COLLECTED,
  SpecimenStatus.RECEIVED,
];

export function isSpecimenAssignable(status: SpecimenStatus) {
  return ASSIGNABLE_SPECIMEN_STATUSES.includes(status);
}

/**
 * The reasons a target test cannot receive a reused specimen. The message is the
 * single source of truth for the error the action throws and the hint the
 * assignment dialog shows next to an ineligible test.
 */
export type SpecimenReuseIneligibility =
  | "NOT_ORDERED"
  | "ALREADY_ASSIGNED"
  | "INCOMPATIBLE_SPECIMEN_TYPE";

export const SPECIMEN_REUSE_INELIGIBILITY_MESSAGE: Record<
  SpecimenReuseIneligibility,
  string
> = {
  NOT_ORDERED:
    "This test is no longer ordered, so it cannot receive a specimen",
  ALREADY_ASSIGNED: "This test already has a specimen assigned",
  INCOMPATIBLE_SPECIMEN_TYPE:
    "This specimen type does not match what the test requires",
};

/**
 * The reasons a lab order cannot receive a reused specimen. The order is the one
 * the assignment is made in, so it has to be open for changes and it has to be
 * the order of the patient the specimen belongs to.
 */
export type SpecimenReuseOrderIneligibility = "NOT_EDITABLE" | "OTHER_PATIENT";

export const SPECIMEN_REUSE_ORDER_INELIGIBILITY_MESSAGE: Record<
  SpecimenReuseOrderIneligibility,
  string
> = {
  NOT_EDITABLE: "This lab order can no longer be changed",
  OTHER_PATIENT: "The specimen belongs to another patient",
};

/** The specimen fields the reuse rules read. */
type ReusableSpecimen = {
  patientId: string;
  specimenType: { id: string };
};

/** The order item fields the reuse rules read. */
type ReuseTargetItem = {
  id: string;
  status: LabOrderItemStatus;
  specimens: { endedAt?: Date | string | null }[];
  performable: {
    displayName: string;
    specimenTypes: { specimenType: { id: string } }[];
  };
};

/**
 * The order fields the reuse rules read. The patient id is optional because the
 * order list projection of the client serializes the patient as a spread, which
 * the client sees as optional fields; the action passes the loaded patient.
 */
type ReuseTargetOrder = {
  status: LabOrderStatus;
  patient: { id?: string | null | undefined } | null;
};

/**
 * Whether the order item accepts the specimen type: the performable of the item
 * lists the specimen types it can be examined from, so the specimen type of the
 * specimen has to be one of them.
 */
export function isSpecimenTypeCompatible(
  item: Pick<ReuseTargetItem, "performable">,
  specimen: Pick<ReusableSpecimen, "specimenType">,
) {
  return item.performable.specimenTypes.some(
    ({ specimenType }) => specimenType.id === specimen.specimenType.id,
  );
}

/**
 * Why the item cannot receive the specimen, or `null` when it can. Reuse is
 * append-only, so an item is only eligible while it is still `ORDERED` and
 * carries no active assignment: attaching a second specimen to it would leave
 * the item with two samples and no rule that says which one counts.
 */
export function getSpecimenReuseItemIneligibility(
  item: ReuseTargetItem,
  specimen: Pick<ReusableSpecimen, "specimenType">,
): SpecimenReuseIneligibility | null {
  if (item.status !== LabOrderItemStatus.ORDERED) {
    return "NOT_ORDERED";
  }

  if (hasActiveSpecimenAssignment(item)) {
    return "ALREADY_ASSIGNED";
  }

  if (!isSpecimenTypeCompatible(item, specimen)) {
    return "INCOMPATIBLE_SPECIMEN_TYPE";
  }

  return null;
}

/**
 * Every item of the order with the reason it cannot receive the specimen, so a
 * view can render the whole order instead of only the items that are eligible.
 */
export function getSpecimenReuseCandidates<T extends ReuseTargetItem>(
  order: { items: T[] },
  specimen: Pick<ReusableSpecimen, "specimenType">,
) {
  return order.items.map((item) => ({
    item,
    ineligibility: getSpecimenReuseItemIneligibility(item, specimen),
  }));
}

/**
 * The order a specimen can be assigned in: the order the dialog was opened from,
 * which has to be editable and to belong to the patient the specimen carries. A
 * specimen belongs to one patient, so pointing it at the tests of another patient
 * would cross the patient boundary the sample carries.
 */
export function getSpecimenReuseOrderIneligibility(
  order: ReuseTargetOrder,
  specimen: Pick<ReusableSpecimen, "patientId">,
): SpecimenReuseOrderIneligibility | null {
  if (!isLabOrderEditable(order)) {
    return "NOT_EDITABLE";
  }

  if (order.patient?.id !== specimen.patientId) {
    return "OTHER_PATIENT";
  }

  return null;
}

/** Whether the order can take the specimen. */
export function isSpecimenReuseTargetOrder(
  order: ReuseTargetOrder,
  specimen: Pick<ReusableSpecimen, "patientId">,
) {
  return getSpecimenReuseOrderIneligibility(order, specimen) === null;
}

/**
 * Throws unless the order is the order the specimen can be assigned in. The
 * action reuses this, so the dialog, the error message and the stored
 * assignments all follow one rule.
 */
export function ensureSpecimenReuseTargetOrderIsEligible(
  order: ReuseTargetOrder,
  specimen: Pick<ReusableSpecimen, "patientId">,
) {
  const ineligibility = getSpecimenReuseOrderIneligibility(order, specimen);

  if (ineligibility) {
    throw new Error(SPECIMEN_REUSE_ORDER_INELIGIBILITY_MESSAGE[ineligibility]);
  }
}

/**
 * Throws unless every requested test belongs to the order and can receive the
 * specimen.
 *
 * The tests of one assignment always come from the single order the assignment
 * is made in: an assignment is the answer to "which tests of this order does
 * this sample cover", and the other orders of the patient are assigned from
 * their own screens.
 */
export function ensureSpecimenReuseTargetItemsAreEligible(
  order: { items: ReuseTargetItem[] },
  specimen: Pick<ReusableSpecimen, "specimenType">,
  orderItemIds: string[],
) {
  for (const orderItemId of orderItemIds) {
    const item = order.items.find(({ id }) => id === orderItemId);

    if (!item) {
      throw new Error("Lab order item is not part of this lab order");
    }

    const ineligibility = getSpecimenReuseItemIneligibility(item, specimen);

    if (ineligibility) {
      throw new Error(SPECIMEN_REUSE_INELIGIBILITY_MESSAGE[ineligibility]);
    }
  }
}
