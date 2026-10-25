"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { UnableToFetchOrderablesError } from "./external-lab-orderable.error";
import {
  storedExternalLabOrderableListSelect,
  storedExternalLabOrderableDetailSelect,
} from "./external-lab-orderable.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  GetExternalLabOrderablesSchema,
  UpsertExternalLabOrderablesSchema,
  GetStoredExternalLabOrderableSchema,
  GetStoredExternalLabOrderablesSchema,
} from "./external-lab-orderable.schema";

type DatabaseClient = typeof prisma;

export async function getExternalLabOrderables({
  type,
  secret,
  baseUrl,
}: z.infer<typeof GetExternalLabOrderablesSchema>) {
  // Set request header.
  const headers: Record<string, string> = { Accept: "application/json" };

  if (type === "API_KEY") {
    headers["X-API-Key"] = `${secret}`;
  } else if (type === "BEARER_TOKEN") {
    headers["Authorization"] = `Bearer ${secret}`;
  }

  const response = await fetch(
    `${baseUrl}/api/integrations/lis/lab-orderables`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new UnableToFetchOrderablesError(
      "Failed to fetch HIS lab orderables.",
    );
  }

  return response.json();
}

export async function getStoredExternalLabOrderables(
  db: Pick<DatabaseClient, "externalLabOrderable">,
  {
    page,
    search,
    isActive,
    pageSize,
    laboratoryId,
    sourceSystem,
  }: z.infer<typeof GetStoredExternalLabOrderablesSchema>,
) {
  const where: Prisma.ExternalLabOrderableWhereInput = {
    laboratoryId,
    ...(search && {
      OR: [
        { externalCode: { contains: search, mode: "insensitive" } },
        { externalDisplay: { contains: search, mode: "insensitive" } },
        { categoryDisplay: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(isActive && { isActive }),
    ...(sourceSystem && { sourceSystem }),
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const storedExternalLabOrderables = await db.externalLabOrderable.findMany({
    where,
    select: storedExternalLabOrderableListSelect,
    orderBy: [{ externalDisplay: "asc" }, { id: "asc" }],
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.externalLabOrderable.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [storedExternalLabOrderables, paginationMeta] as const;
}

export async function getStoredExternalLabOrderable(
  db: Pick<DatabaseClient, "externalLabOrderable">,
  { id, laboratoryId }: z.infer<typeof GetStoredExternalLabOrderableSchema>,
) {
  return db.externalLabOrderable.findFirst({
    where: { id, laboratoryId },
    select: storedExternalLabOrderableDetailSelect,
  });
}

export async function upsertExternalLabOrderables(
  db: Pick<DatabaseClient, "externalLabOrderable">,
  {
    items,
    connectionId,
    laboratoryId,
    sourceSystem,
  }: z.infer<typeof UpsertExternalLabOrderablesSchema>,
) {
  let created = 0;
  let updated = 0;

  for (const item of items) {
    const existing = await db.externalLabOrderable.findUnique({
      where: {
        laboratoryId_sourceSystem_externalOrderableId: {
          laboratoryId,
          sourceSystem,
          externalOrderableId: item.orderableId,
        },
      },
    });

    await db.externalLabOrderable.upsert({
      where: {
        laboratoryId_sourceSystem_externalOrderableId: {
          laboratoryId,
          sourceSystem,
          externalOrderableId: item.orderableId,
        },
      },
      create: {
        type: item.type,
        isActive: item.status === "ACTIVE",
        connection: { connect: { id: connectionId } },
        laboratory: { connect: { id: laboratoryId } },
        categoryCode: item.category?.code,
        externalCode: item.code,
        lastSyncedAt: new Date(),
        sourceSystem,
        categoryDisplay: item.category?.display,
        externalDisplay: item.display,
        externalCodeSystem: item.codeSystem,
        rawCatalogSnapshot: item,
        externalOrderableId: item.orderableId,
      },
      update: {
        type: item.type,
        isActive: item.status === "ACTIVE",
        categoryCode: item.category?.code,
        externalCode: item.code,
        lastSyncedAt: new Date(),
        categoryDisplay: item.category?.display,
        externalDisplay: item.display,
        externalCodeSystem: item.codeSystem,
        rawCatalogSnapshot: item,
      },
    });

    if (existing) {
      updated++;
    } else {
      created++;
    }
  }

  return {
    created,
    updated,
  };
}
