"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import {
  encrypt,
  buildCredentialStatusFilter,
} from "./integration-credential.helper";
import {
  integrationCredentialListSelect,
  integrationCredentialDetailSelect,
} from "./integration-credential.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  GetIntegrationCredentialSchema,
  UseIntegrationCredentialSchema,
  GetIntegrationCredentialsSchema,
  CreateIntegrationCredentialSchema,
  RevokeIntegrationCredentialSchema,
} from "./integration-credential.schema";

type DatabaseClient = typeof prisma;

export async function createIntegrationCredential(
  db: Pick<DatabaseClient, "integrationCredential">,
  {
    name,
    secret,
    expiresAt,
    connectionId,
    laboratoryId,
    createdByUserId,
  }: z.infer<typeof CreateIntegrationCredentialSchema>,
) {
  const { encryptedSecret, secretPrefix } = encrypt(secret);

  return db.integrationCredential.create({
    data: {
      name,
      expiresAt: expiresAt ?? null,
      connectionId,
      laboratoryId,
      secretPrefix,
      encryptedSecret,
      createdByUserId: createdByUserId ?? null,
    },
    select: integrationCredentialDetailSelect,
  });
}

export async function getIntegrationCredentials(
  db: Pick<DatabaseClient, "integrationCredential">,
  {
    page,
    search,
    status,
    pageSize,
    connectionId,
    laboratoryId,
  }: z.infer<typeof GetIntegrationCredentialsSchema>,
) {
  const where: Prisma.IntegrationCredentialWhereInput = {
    connectionId,
    laboratoryId,
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...buildCredentialStatusFilter(status),
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const integrationCredentials = await db.integrationCredential.findMany({
    where,
    select: integrationCredentialListSelect,
    orderBy: { createdAt: "desc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.integrationCredential.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [integrationCredentials, paginationMeta] as const;
}

export async function getIntegrationCredential(
  db: Pick<DatabaseClient, "integrationCredential">,
  {
    id,
    onlyActive,
    laboratoryId,
  }: z.infer<typeof GetIntegrationCredentialSchema>,
) {
  return db.integrationCredential.findFirst({
    where: {
      id,
      laboratoryId,
      ...(onlyActive && {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        revokedAt: null,
      }),
    },
    select: integrationCredentialDetailSelect,
  });
}

export async function revokeIntegrationCredential(
  db: Pick<DatabaseClient, "integrationCredential">,
  {
    id,
    laboratoryId,
    revokedByUserId,
  }: z.infer<typeof RevokeIntegrationCredentialSchema>,
) {
  return db.integrationCredential.update({
    where: { id, laboratoryId },
    data: {
      revokedAt: new Date(),
      revokedByUserId: revokedByUserId ?? null,
    },
    select: integrationCredentialDetailSelect,
  });
}

export async function useIntegrationCredential(
  db: Pick<DatabaseClient, "integrationCredential">,
  { id, laboratoryId }: z.infer<typeof UseIntegrationCredentialSchema>,
) {
  // Fire and forget — lastUsedAt is informational and should not delay the response.
  void db.integrationCredential.update({
    where: { id, laboratoryId },
    data: { lastUsedAt: new Date() },
  });
}
