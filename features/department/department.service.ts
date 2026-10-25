"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import {
  GetDepartmentSchema,
  GetDepartmentsSchema,
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
} from "./department.schema";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  departmentListSelect,
  departmentDetailSelect,
} from "./department.select";

type DatabaseClient = typeof prisma;

export async function createDepartment(
  db: Pick<DatabaseClient, "department">,
  {
    code,
    color,
    isActive,
    description,
    displayName,
    laboratoryId,
  }: z.infer<typeof CreateDepartmentSchema>,
) {
  return db.department.create({
    data: {
      code,
      color,
      isActive,
      description,
      displayName,
      laboratory: { connect: { id: laboratoryId } },
    },
    select: departmentDetailSelect,
  });
}

export async function getDepartments(
  db: Pick<DatabaseClient, "department">,
  {
    page,
    search,
    isActive,
    pageSize,
    laboratoryId,
  }: z.infer<typeof GetDepartmentsSchema>,
) {
  const where: Prisma.DepartmentWhereInput = {
    ...(search && {
      OR: [
        { code: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
      ],
    }),
    isActive,
    laboratoryId,
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const departments = await db.department.findMany({
    where,
    select: departmentListSelect,
    orderBy: { createdAt: "desc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.department.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [departments, paginationMeta] as const;
}

export async function getDepartment(
  db: Pick<DatabaseClient, "department">,
  { id, laboratoryId }: z.infer<typeof GetDepartmentSchema>,
) {
  return db.department.findFirst({
    where: { id, laboratoryId },
    select: departmentDetailSelect,
  });
}

export async function updateDepartment(
  db: Pick<DatabaseClient, "department">,
  {
    id,
    color,
    isActive,
    description,
    displayName,
    laboratoryId,
  }: z.infer<typeof UpdateDepartmentSchema>,
) {
  return db.department.update({
    where: { id, laboratoryId },
    data: { color, isActive, description, displayName },
    select: departmentDetailSelect,
  });
}
