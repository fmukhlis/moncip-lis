import { Prisma } from "@/generated/prisma";
import { departmentBaseSelect } from "../department/department.base-select";

export const userBaseSelect = {
  id: true,
  name: true,
  role: true,
  email: true,
  image: true,
  username: true,
  departmentId: true,
} satisfies Prisma.UserSelect;

export const userListSelect = {
  ...userBaseSelect,
  createdAt: true,
  updatedAt: true,
  department: {
    select: departmentBaseSelect,
  },
} satisfies Prisma.UserSelect;

export const userOptionSelect = {
  id: true,
  name: true,
  username: true,
  role: true,
} satisfies Prisma.UserSelect;

export const userDetailSelect = {
  ...userBaseSelect,
  createdAt: true,
  updatedAt: true,
  department: {
    select: departmentBaseSelect,
  },
  emailVerified: true,
} satisfies Prisma.UserSelect;
