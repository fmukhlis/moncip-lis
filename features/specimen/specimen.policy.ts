import { SpecimenStatus } from "@/generated/prisma";

const IMMUTABLE_SPECIMEN_STATUSES: SpecimenStatus[] = ["CANCELLED", "REJECTED"];

/**
 * The collection record is logged while the specimen is pending and corrected
 * once it is collected. Correcting it must never change the status, the receipt
 * record or the assignment history, which is why `resolveCollectedStatus` keeps
 * the current status for a collected or received specimen.
 */
const COLLECTABLE_SPECIMEN_STATUSES: SpecimenStatus[] = [
  SpecimenStatus.PENDING,
  SpecimenStatus.COLLECTED,
  SpecimenStatus.RECEIVED,
];

/**
 * The receipt record is logged while the specimen is collected and corrected
 * once it is received. Correcting it must never move the specimen backwards,
 * which is why `resolveReceivedStatus` keeps the current status for a received
 * specimen.
 */
const RECEIVABLE_SPECIMEN_STATUSES: SpecimenStatus[] = [
  SpecimenStatus.COLLECTED,
  SpecimenStatus.RECEIVED,
];

export function ensureSpecimenIsEditable(specimen: { status: SpecimenStatus }) {
  if (IMMUTABLE_SPECIMEN_STATUSES.includes(specimen.status)) {
    throw new Error("Specimen is not editable");
  }
}

export function ensureSpecimenCanBeCollected(specimen: {
  status: SpecimenStatus;
}) {
  if (!COLLECTABLE_SPECIMEN_STATUSES.includes(specimen.status)) {
    throw new Error("Specimen cannot be collected");
  }
}

export function ensureSpecimenCanBeReceived(specimen: {
  status: SpecimenStatus;
}) {
  if (!RECEIVABLE_SPECIMEN_STATUSES.includes(specimen.status)) {
    throw new Error("Specimen cannot be received");
  }
}

/**
 * The status a collection writes: a pending specimen becomes collected, while a
 * collected or received specimen keeps the status it already has.
 */
export function resolveCollectedStatus(status: SpecimenStatus): SpecimenStatus {
  return status === SpecimenStatus.PENDING ? SpecimenStatus.COLLECTED : status;
}

/**
 * The status a receipt writes: a collected specimen becomes received, while a
 * received specimen keeps the status it already has.
 */
export function resolveReceivedStatus(status: SpecimenStatus): SpecimenStatus {
  return status === SpecimenStatus.COLLECTED ? SpecimenStatus.RECEIVED : status;
}
