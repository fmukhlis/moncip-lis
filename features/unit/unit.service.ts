"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { GetUnitSchema, GetUnitsSchema } from "./unit.schema";
import { unitDetailSelect, unitListSelect } from "./unit.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";

type DatabaseClient = typeof prisma;

export async function getUnits(
  db: Pick<DatabaseClient, "unit">,
  { page, search, pageSize, isActive }: z.infer<typeof GetUnitsSchema>,
) {
  const where: Prisma.UnitWhereInput = {
    ...(search && {
      OR: [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(isActive !== undefined && { isActive }),
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const units = await db.unit.findMany({
    where,
    select: unitListSelect,
    orderBy: { displayName: "asc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.unit.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [units, paginationMeta] as const;
}

export async function getUnit(
  db: Pick<DatabaseClient, "unit">,
  { id }: z.infer<typeof GetUnitSchema>,
) {
  return db.unit.findFirst({ where: { id }, select: unitDetailSelect });
}
