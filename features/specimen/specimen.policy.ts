import { SpecimenStatus } from "@/generated/prisma";

const IMMUTABLE_SPECIMEN_STATUSES: SpecimenStatus[] = ["CANCELLED", "REJECTED"];

const COLLECTABLE_SPECIMEN_STATUSES: SpecimenStatus[] = [
  SpecimenStatus.PENDING,
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

export function resolveCollectedStatus(status: SpecimenStatus): SpecimenStatus {
  return status === SpecimenStatus.PENDING ? SpecimenStatus.COLLECTED : status;
}
