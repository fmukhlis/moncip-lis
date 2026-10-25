import { Prisma } from "@/generated/prisma";
import { unitBaseSelect } from "../unit/unit.select";

export const lisResultComponentBaseSelect = {
  id: true,
  code: true,
  sortOrder: true,
  valueType: true,
  displayName: true,
} satisfies Prisma.LisResultComponentSelect;

export const lisResultComponentListSelect = {
  ...lisResultComponentBaseSelect,
  unit: { select: unitBaseSelect },
  isActive: true,
  isRequired: true,
  decimalPlaces: true,
} satisfies Prisma.LisResultComponentSelect;

export const lisResultComponentDetailSelect = {
  ...lisResultComponentBaseSelect,
  unit: { select: unitBaseSelect },
  isActive: true,
  createdAt: true,
  updatedAt: true,
  isRequired: true,
  decimalPlaces: true,
} satisfies Prisma.LisResultComponentSelect;
