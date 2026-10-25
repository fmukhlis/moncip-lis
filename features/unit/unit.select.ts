import { Prisma } from "@/generated/prisma";

export const unitBaseSelect = {
  id: true,
  code: true,
  isActive: true,
  displayName: true,
  description: true,
} satisfies Prisma.UnitSelect;

export const unitListSelect = {
  ...unitBaseSelect,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UnitSelect;

export const unitDetailSelect = {
  ...unitBaseSelect,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UnitSelect;
