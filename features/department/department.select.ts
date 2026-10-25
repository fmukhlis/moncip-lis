import { Prisma } from "@/generated/prisma";
import { departmentBaseSelect } from "./department.base-select";
import { lisPerformableBaseSelect } from "../lis-performable/lis-performable.select";

export const departmentListSelect = {
  ...departmentBaseSelect,
  createdAt: true,
  updatedAt: true,
  _count: { select: { performables: { where: { isActive: true } } } },
} satisfies Prisma.DepartmentSelect;

export const departmentDetailSelect = {
  ...departmentBaseSelect,
  createdAt: true,
  updatedAt: true,
  performables: {
    select: {
      ...lisPerformableBaseSelect,
    },
  },
} satisfies Prisma.DepartmentSelect;
