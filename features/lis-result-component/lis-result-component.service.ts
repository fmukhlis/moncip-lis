"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import {
  lisResultComponentListSelect,
  lisResultComponentDetailSelect,
} from "./lis-result-component.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  GetLisResultComponentSchema,
  GetLisResultComponentsSchema,
  CreateLisResultComponentSchema,
  UpdateLisResultComponentSchema,
  GetLisResultComponentNextSortOrderSchema,
} from "./lis-result-component.schema";

type DatabaseClient = typeof prisma;

export async function createLisResultComponent(
  db: Pick<DatabaseClient, "lisResultComponent">,
  {
    code,
    unitId,
    isActive,
    sortOrder,
    valueType,
    isRequired,
    displayName,
    laboratoryId,
    decimalPlaces,
    performableId,
  }: z.infer<typeof CreateLisResultComponentSchema>,
) {
  return db.lisResultComponent.create({
    data: {
      code,
      unit: unitId ? { connect: { id: unitId } } : undefined,
      isActive,
      sortOrder,
      valueType,
      isRequired,
      laboratory: { connect: { id: laboratoryId } },
      displayName,
      performable: { connect: { id: performableId } },
      decimalPlaces,
    },
    select: lisResultComponentDetailSelect,
  });
}

export async function getLisResultComponentNextSortOrder(
  db: Pick<DatabaseClient, "lisResultComponent">,
  {
    laboratoryId,
    performableId,
  }: z.infer<typeof GetLisResultComponentNextSortOrderSchema>,
) {
  const lisResultComponent = await db.lisResultComponent.aggregate({
    where: { laboratoryId, performableId },
    _max: { sortOrder: true },
  });

  return lisResultComponent._max.sortOrder ?? 1;
}

export async function getLisResultComponents(
  db: Pick<DatabaseClient, "lisResultComponent">,
  {
    page,
    search,
    isActive,
    pageSize,
    isRequired,
    laboratoryId,
    performableId,
  }: z.infer<typeof GetLisResultComponentsSchema>,
) {
  const where: Prisma.LisResultComponentWhereInput = {
    laboratoryId,
    ...(search && {
      OR: [
        { code: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(isActive !== undefined && { isActive }),
    ...(isRequired !== undefined && { isRequired }),
    ...(performableId && { performableId }),
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const lisResultComponents = await db.lisResultComponent.findMany({
    where,
    select: lisResultComponentListSelect,
    orderBy: { sortOrder: "asc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.lisResultComponent.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.page,
    );
  }

  return [lisResultComponents, paginationMeta] as const;
}

export async function getLisResultComponent(
  db: Pick<DatabaseClient, "lisResultComponent">,
  { id, laboratoryId }: z.infer<typeof GetLisResultComponentSchema>,
) {
  return db.lisResultComponent.findFirst({
    where: { id, laboratoryId },
    select: lisResultComponentDetailSelect,
  });
}

export async function updateLisResultComponent(
  db: Pick<DatabaseClient, "lisResultComponent">,
  {
    id,
    unitId,
    isActive,
    sortOrder,
    valueType,
    isRequired,
    displayName,
    laboratoryId,
    decimalPlaces,
  }: z.infer<typeof UpdateLisResultComponentSchema>,
) {
  return db.lisResultComponent.update({
    where: { id, laboratoryId },
    data: {
      unit: unitId ? { connect: { id: unitId } } : undefined,
      isActive,
      sortOrder,
      valueType,
      isRequired,
      displayName,
      decimalPlaces,
    },
    select: lisResultComponentDetailSelect,
  });
}
