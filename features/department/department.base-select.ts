import { Prisma } from "@/generated/prisma";

export const departmentBaseSelect = {
  id: true,
  code: true,
  color: true,
  isActive: true,
  description: true,
  displayName: true,
} satisfies Prisma.DepartmentSelect;
