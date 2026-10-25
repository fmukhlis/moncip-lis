import { SpecimenStatus } from "@/generated/prisma";

const IMMUTABLE_SPECIMEN_STATUSES: SpecimenStatus[] = ["CANCELLED", "REJECTED"];

export function ensureSpecimenIsEditable(specimen: { status: SpecimenStatus }) {
  if (IMMUTABLE_SPECIMEN_STATUSES.includes(specimen.status)) {
    throw new Error("Specimen is not editable");
  }
}
