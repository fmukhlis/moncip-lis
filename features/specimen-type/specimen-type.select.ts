import { Prisma } from "@/generated/prisma";

export const specimenTypeBaseSelect = {
  id: true,
  code: true,
  isActive: true,
  displayName: true,
} satisfies Prisma.SpecimenTypeSelect;

export const specimenTypeListSelect = {
  ...specimenTypeBaseSelect,
} satisfies Prisma.SpecimenTypeSelect;

export const specimenTypeDetailSelect = {
  ...specimenTypeBaseSelect,
  createdAt: true,
  updatedAt: true,
  description: true,
} satisfies Prisma.SpecimenTypeSelect;
