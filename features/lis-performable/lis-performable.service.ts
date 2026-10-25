"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  lisPerformableListSelect,
  lisPerformableDetailSelect,
} from "./lis-performable.select";
import {
  GetLisPerformableSchema,
  GetLisPerformablesSchema,
  CreateLisPerformableSchema,
  UpdateLisPerformableSchema,
} from "./lis-performable.schema";

type DatabaseClient = typeof prisma;

export async function createLisPerformable(
  db: Pick<DatabaseClient, "lisPerformable">,
  {
    type,
    isActive,
    displayName,
    departmentId,
    laboratoryId,
    specimenTypes,
    externalOrderableId,
  }: z.infer<typeof CreateLisPerformableSchema>,
) {
  return db.lisPerformable.create({
    data: {
      type,
      isActive,
      department: { connect: { id: departmentId } },
      laboratory: { connect: { id: laboratoryId } },
      displayName,
      specimenTypes: {
        create: specimenTypes.map(({ id, isDefault }) => ({
          isDefault,
          specimenType: { connect: { id } },
        })),
      },
      externalOrderable: { connect: { id: externalOrderableId } },
    },
    select: lisPerformableDetailSelect,
  });
}

export async function getLisPerformables(
  db: Pick<DatabaseClient, "lisPerformable">,
  {
    page,
    type,
    search,
    isActive,
    pageSize,
    departmentId,
    laboratoryId,
  }: z.infer<typeof GetLisPerformablesSchema>,
) {
  const where: Prisma.LisPerformableWhereInput = {
    ...(type && { type }),
    ...(search && {
      OR: [{ displayName: { contains: search, mode: "insensitive" } }],
    }),
    ...(isActive && { isActive }),
    ...(departmentId && { departmentId }),
    laboratoryId,
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const lisPerformables = await db.lisPerformable.findMany({
    where,
    select: lisPerformableListSelect,
    orderBy: { displayName: "asc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.lisPerformable.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [lisPerformables, paginationMeta] as const;
}

export async function getLisPerformable(
  db: Pick<DatabaseClient, "lisPerformable">,
  { id, laboratoryId }: z.infer<typeof GetLisPerformableSchema>,
) {
  return db.lisPerformable.findFirst({
    where: { id, laboratoryId },
    select: lisPerformableDetailSelect,
  });
}

export async function updateLisPerformable(
  db: Pick<DatabaseClient, "lisPerformable">,
  {
    id,
    type,
    isActive,
    displayName,
    departmentId,
    laboratoryId,
    specimenTypes,
  }: z.infer<typeof UpdateLisPerformableSchema>,
) {
  return db.lisPerformable.update({
    where: { id, laboratoryId },
    data: {
      type,
      isActive,
      department: departmentId ? { connect: { id: departmentId } } : undefined,
      displayName,
      specimenTypes: specimenTypes
        ? {
            deleteMany: {},
            create: specimenTypes.map(({ id, isDefault }) => ({
              isDefault,
              specimenType: { connect: { id } },
            })),
          }
        : undefined,
    },
    select: lisPerformableDetailSelect,
  });
}
