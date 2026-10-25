"use server";

import crypto from "crypto";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import {
  integrationTokenListSelect,
  integrationTokenDetailSelect,
} from "./integration-token.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  buildToken,
  buildTokenStatusFilter,
  TOKEN_PREFIX_STORED_LENGTH,
} from "./integration-token.helper";
import {
  GetIntegrationTokenSchema,
  GetIntegrationTokensSchema,
  CreateIntegrationTokenSchema,
  RevokeIntegrationTokenSchema,
  VerifyIntegrationTokenSchema,
} from "./integration-token.schema";

type DatabaseClient = typeof prisma;

export async function createIntegrationToken(
  db: Pick<DatabaseClient, "integrationToken">,
  {
    name,
    expiresAt,
    connectionId,
    laboratoryId,
    sourceSystem,
    createdByUserId,
  }: z.infer<typeof CreateIntegrationTokenSchema>,
) {
  const { plaintext, hash, prefix } = buildToken(sourceSystem);

  const integrationToken = await db.integrationToken.create({
    data: {
      name,
      expiresAt: expiresAt ?? null,
      tokenHash: hash,
      tokenPrefix: prefix,
      connectionId,
      laboratoryId,
      createdByUserId: createdByUserId ?? null,
    },
    select: integrationTokenDetailSelect,
  });

  return { integrationToken, plaintext };
}

export async function getIntegrationTokens(
  db: Pick<DatabaseClient, "integrationToken">,
  {
    page,
    search,
    status,
    pageSize,
    connectionId,
    laboratoryId,
  }: z.infer<typeof GetIntegrationTokensSchema>,
) {
  const where: Prisma.IntegrationTokenWhereInput = {
    connectionId,
    laboratoryId,
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...buildTokenStatusFilter(status),
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const integrationTokens = await db.integrationToken.findMany({
    where,
    select: integrationTokenListSelect,
    orderBy: { createdAt: "desc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.integrationToken.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [integrationTokens, paginationMeta] as const;
}

export async function getIntegrationToken(
  db: Pick<DatabaseClient, "integrationToken">,
  { id, laboratoryId }: z.infer<typeof GetIntegrationTokenSchema>,
) {
  return db.integrationToken.findFirst({
    where: { id, laboratoryId },
    select: integrationTokenDetailSelect,
  });
}

export async function revokeIntegrationToken(
  db: Pick<DatabaseClient, "integrationToken">,
  {
    id,
    laboratoryId,
    revokedByUserId,
  }: z.infer<typeof RevokeIntegrationTokenSchema>,
) {
  return db.integrationToken.update({
    where: { id, laboratoryId },
    data: {
      revokedAt: new Date(),
      revokedByUserId: revokedByUserId ?? null,
    },
    select: integrationTokenDetailSelect,
  });
}

export async function verifyIntegrationToken(
  db: Pick<DatabaseClient, "integrationToken">,
  { plaintext }: z.infer<typeof VerifyIntegrationTokenSchema>,
) {
  const prefix = plaintext.slice(0, TOKEN_PREFIX_STORED_LENGTH);
  const hash = crypto.createHash("sha256").update(plaintext).digest("hex");

  const token = await db.integrationToken.findFirst({
    where: {
      tokenPrefix: prefix,
      tokenHash: hash,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: integrationTokenDetailSelect,
  });

  if (!token) return null;
  if (!token.connection.isActive) return null;

  // Fire and forget — lastUsedAt is informational and should not delay the response.
  void db.integrationToken.update({
    where: { id: token.id },
    data: { lastUsedAt: new Date() },
  });

  return token;
}
