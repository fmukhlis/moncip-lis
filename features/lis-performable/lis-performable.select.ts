import { Prisma } from "@/generated/prisma";
import { departmentBaseSelect } from "../department/department.base-select";
import { specimenTypeBaseSelect } from "../specimen-type/specimen-type.select";
import { lisResultComponentListSelect } from "../lis-result-component/lis-result-component.select";

export const lisPerformableBaseSelect = {
  id: true,
  type: true,
  isActive: true,
  displayName: true,
} satisfies Prisma.LisPerformableSelect;

export const lisPerformableListSelect = {
  ...lisPerformableBaseSelect,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      specimenTypes: { where: { specimenType: { isActive: true } } },
      resultComponents: { where: { isActive: true } },
    },
  },
} satisfies Prisma.LisPerformableSelect;

export const lisPerformableDetailSelect = {
  ...lisPerformableBaseSelect,
  createdAt: true,
  updatedAt: true,
  department: { select: departmentBaseSelect },
  specimenTypes: {
    select: {
      isDefault: true,
      specimenType: { select: specimenTypeBaseSelect },
    },
  },
  resultComponents: {
    select: lisResultComponentListSelect,
    orderBy: {
      sortOrder: "asc",
    },
  },
} satisfies Prisma.LisPerformableSelect;
