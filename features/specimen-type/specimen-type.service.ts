"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import {
  specimenTypeListSelect,
  specimenTypeDetailSelect,
} from "./specimen-type.select";
import {
  GetSpecimenTypeSchema,
  GetSpecimenTypesSchema,
} from "./specimen-type.schema";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";

type DatabaseClient = typeof prisma;

export async function getSpecimenTypes(
  db: Pick<DatabaseClient, "specimenType">,
  { page, search, isActive, pageSize }: z.infer<typeof GetSpecimenTypesSchema>,
) {
  const where: Prisma.SpecimenTypeWhereInput = {
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

  const specimenTypes = await db.specimenType.findMany({
    where,
    select: specimenTypeListSelect,
    orderBy: { displayName: "asc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.specimenType.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }
  return [specimenTypes, paginationMeta] as const;
}

export async function getSpecimenType(
  db: Pick<DatabaseClient, "specimenType">,
  { id }: z.infer<typeof GetSpecimenTypeSchema>,
) {
  return db.specimenType.findFirst({
    where: { id },
    select: specimenTypeDetailSelect,
  });
}
