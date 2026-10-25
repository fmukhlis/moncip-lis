import { Prisma } from "@/generated/prisma";

export const patientBaseSelect = {
  id: true,
  mrn: true,
  sex: true,
  name: true,
  phone: true,
  address: true,
  dateOfBirth: true,
} satisfies Prisma.PatientSelect;

export const patientListSelect = {
  ...patientBaseSelect,
  linkedAt: true,
  createdAt: true,
  deletedAt: true,
  externalPatientId: true,
} satisfies Prisma.PatientSelect;

export const patientDetailSelect = {
  ...patientBaseSelect,
  linkedAt: true,
  createdAt: true,
  deletedAt: true,
  updatedAt: true,
  lastSnapshot: true,
  lastSyncedAt: true,
  sourceSystem: true,
  externalPatientId: true,
} satisfies Prisma.PatientSelect;
