import { Prisma } from "@/generated/prisma";

export const labOrderBaseSelect = {
  id: true,
  no: true,
  status: true,
  priority: true,
  externalId: true,
  externalNo: true,
  externalPatientId: true,
  externalEncounterId: true,
  externalOrderingProviderId: true,
} satisfies Prisma.LabOrderSelect;
