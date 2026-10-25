"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  getIntegrationConnection,
  getIntegrationConnections,
  createIntegrationConnection,
  updateIntegrationConnection,
} from "./integration-connection.service";
import {
  GetIntegrationConnectionSchema,
  GetIntegrationConnectionsSchema,
  CreateIntegrationConnectionSchema,
  UpdateIntegrationConnectionSchema,
  GetIntegrationConnectionActionSchema,
  GetIntegrationConnectionsActionSchema,
  CreateIntegrationConnectionActionSchema,
  UpdateIntegrationConnectionActionSchema,
} from "./integration-connection.schema";

export async function createIntegrationConnectionAction(
  params: z.infer<typeof CreateIntegrationConnectionActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_CONNECTION:CREATE")) {
    throw new UnauthorizedError(
      "You don't have permission to create an integration connection.",
    );
  }

  const { laboratoryId } = user;

  const parsedCreateIntegrationConnectionParams =
    CreateIntegrationConnectionSchema.parse({ ...params, laboratoryId });

  const integrationConnection = await createIntegrationConnection(
    prisma,
    parsedCreateIntegrationConnectionParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...integrationConnection,
      tokens: integrationConnection.tokens.map(
        ({ createdAt, expiresAt, lastUsedAt, revokedAt, ...rest }) => ({
          ...rest,
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt?.toISOString(),
          revokedAt: revokedAt?.toISOString(),
          lastUsedAt: lastUsedAt?.toISOString(),
        }),
      ),
      createdAt: integrationConnection.createdAt.toISOString(),
      updatedAt: integrationConnection.updatedAt.toISOString(),
      credentials: integrationConnection.credentials.map(
        ({ createdAt, expiresAt, lastUsedAt, revokedAt, ...rest }) => ({
          ...rest,
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt?.toISOString(),
          revokedAt: revokedAt?.toISOString(),
          lastUsedAt: lastUsedAt?.toISOString(),
        }),
      ),
    },
  };
}

export async function getIntegrationConnectionsAction(
  params: z.infer<typeof GetIntegrationConnectionsActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_CONNECTION:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view integration connections.",
    );
  }

  const { laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    const parsedGetIntegrationConnectionsParams =
      GetIntegrationConnectionsSchema.parse({ ...params, laboratoryId });

    const [integrationConnections, paginationMeta] =
      await getIntegrationConnections(
        tx,
        parsedGetIntegrationConnectionsParams,
      );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: integrationConnections.map((integrationConnection) => ({
        ...integrationConnection,
        createdAt: integrationConnection.createdAt.toISOString(),
        updatedAt: integrationConnection.updatedAt.toISOString(),
      })),
      paginationMeta,
    };
  });
}

export async function getIntegrationConnectionAction(
  params: z.infer<typeof GetIntegrationConnectionActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_CONNECTION:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this integration connection.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetIntegrationConnectionParams =
    GetIntegrationConnectionSchema.parse({ ...params, laboratoryId });

  const integrationConnection = await getIntegrationConnection(
    prisma,
    parsedGetIntegrationConnectionParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: integrationConnection
      ? {
          ...integrationConnection,
          tokens: integrationConnection.tokens.map(
            ({ createdAt, expiresAt, lastUsedAt, revokedAt, ...rest }) => ({
              ...rest,
              createdAt: createdAt.toISOString(),
              expiresAt: expiresAt?.toISOString(),
              revokedAt: revokedAt?.toISOString(),
              lastUsedAt: lastUsedAt?.toISOString(),
            }),
          ),
          createdAt: integrationConnection.createdAt.toISOString(),
          updatedAt: integrationConnection.updatedAt.toISOString(),
          credentials: integrationConnection.credentials.map(
            ({ createdAt, expiresAt, lastUsedAt, revokedAt, ...rest }) => ({
              ...rest,
              createdAt: createdAt.toISOString(),
              expiresAt: expiresAt?.toISOString(),
              revokedAt: revokedAt?.toISOString(),
              lastUsedAt: lastUsedAt?.toISOString(),
            }),
          ),
        }
      : null,
  };
}

export async function updateIntegrationConnectionAction(
  params: z.infer<typeof UpdateIntegrationConnectionActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_CONNECTION:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to update this integration connections.",
    );
  }

  const { laboratoryId } = user;

  const parsedUpdateIntegrationConnectionParams =
    UpdateIntegrationConnectionSchema.parse({ ...params, laboratoryId });

  const integrationConnection = await updateIntegrationConnection(
    prisma,
    parsedUpdateIntegrationConnectionParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...integrationConnection,
      tokens: integrationConnection.tokens.map(
        ({ createdAt, expiresAt, lastUsedAt, revokedAt, ...rest }) => ({
          ...rest,
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt?.toISOString(),
          revokedAt: revokedAt?.toISOString(),
          lastUsedAt: lastUsedAt?.toISOString(),
        }),
      ),
      createdAt: integrationConnection.createdAt.toISOString(),
      updatedAt: integrationConnection.updatedAt.toISOString(),
      credentials: integrationConnection.credentials.map(
        ({ createdAt, expiresAt, lastUsedAt, revokedAt, ...rest }) => ({
          ...rest,
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt?.toISOString(),
          revokedAt: revokedAt?.toISOString(),
          lastUsedAt: lastUsedAt?.toISOString(),
        }),
      ),
    },
  };
}
