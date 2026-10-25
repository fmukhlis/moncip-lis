"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import {
  integrationConnectionListSelect,
  integrationConnectionDetailSelect,
} from "./integration-connection.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "../../lib/pagination";
import {
  GetIntegrationConnectionSchema,
  GetIntegrationConnectionsSchema,
  CreateIntegrationConnectionSchema,
  UpdateIntegrationConnectionSchema,
} from "./integration-connection.schema";

type DatabaseClient = typeof prisma;

/**
 * Create a new integration connection for a laboratory.
 *
 * Caller should handle:
 *   P2002 — unique constraint violation on [laboratoryId, sourceSystem, name].
 */
export async function createIntegrationConnection(
  db: Pick<DatabaseClient, "integrationConnection">,
  {
    name,
    type,
    baseUrl,
    isActive,
    laboratoryId,
    sourceSystem,
  }: z.infer<typeof CreateIntegrationConnectionSchema>,
) {
  return db.integrationConnection.create({
    data: {
      name,
      type,
      baseUrl: baseUrl ?? null,
      isActive,
      laboratoryId,
      sourceSystem,
    },
    select: integrationConnectionDetailSelect,
  });
}

/**
 * List integration connections for a laboratory.
 *
 * Supports:
 *   - Filtering by sourceSystem, isActive, and name search (case-insensitive)
 *   - Optional pagination via page/pageSize
 *
 * When page/pageSize are omitted, all matching records are returned and
 * `pagination` is null. Useful for dropdowns/selects that need all records.
 */
export async function getIntegrationConnections(
  db: Pick<DatabaseClient, "integrationConnection">,
  {
    page,
    search,
    isActive,
    pageSize,
    laboratoryId,
    sourceSystem,
  }: z.infer<typeof GetIntegrationConnectionsSchema>,
) {
  const where: Prisma.IntegrationConnectionWhereInput = {
    laboratoryId: laboratoryId,
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...(isActive !== undefined && { isActive }),
    ...(sourceSystem !== undefined && { sourceSystem }),
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const integrationConnections = await db.integrationConnection.findMany({
    where,
    select: integrationConnectionListSelect,
    orderBy: { createdAt: "desc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.integrationConnection.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [integrationConnections, paginationMeta] as const;
}

/**
 * Fetch the full detail of a connection including its tokens.
 * Returns null when not found or when the connection belongs to another lab.
 */
export async function getIntegrationConnection(
  db: Pick<DatabaseClient, "integrationConnection">,
  { id, laboratoryId }: z.infer<typeof GetIntegrationConnectionSchema>,
) {
  return db.integrationConnection.findFirst({
    where: { id, laboratoryId },
    select: integrationConnectionDetailSelect,
  });
}

/**
 * Update mutable fields on a connection.
 *
 * Caller should handle:
 *   P2025 — record not found or lab mismatch.
 *   P2002 — new name creates a uniqueness conflict.
 */
export async function updateIntegrationConnection(
  db: Pick<DatabaseClient, "integrationConnection">,
  {
    id,
    name,
    type,
    baseUrl,
    isActive,
    laboratoryId,
  }: z.infer<typeof UpdateIntegrationConnectionSchema>,
) {
  return db.integrationConnection.update({
    where: { id, laboratoryId },
    data: { name, type, baseUrl, isActive },
    select: integrationConnectionDetailSelect,
  });
}
