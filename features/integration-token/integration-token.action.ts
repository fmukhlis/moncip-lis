"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import { getIntegrationConnection } from "../integration-connection/integration-connection.service";
import { GetIntegrationConnectionSchema } from "../integration-connection/integration-connection.schema";
import {
  getIntegrationToken,
  getIntegrationTokens,
  createIntegrationToken,
  revokeIntegrationToken,
} from "./integration-token.service";
import {
  GetIntegrationTokenSchema,
  GetIntegrationTokensSchema,
  CreateIntegrationTokenSchema,
  RevokeIntegrationTokenSchema,
  RotateIntegrationTokenSchema,
  GetIntegrationTokenActionSchema,
  GetIntegrationTokensActionSchema,
  CreateIntegrationTokenActionSchema,
  RevokeIntegrationTokenActionSchema,
  RotateIntegrationTokenActionSchema,
} from "./integration-token.schema";

export async function createIntegrationTokenAction(
  params: z.infer<typeof CreateIntegrationTokenActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_TOKEN:CREATE")) {
    throw new UnauthorizedError(
      "You don't have permission to create an integration token.",
    );
  }

  const { id, laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    // Since the sourceSystem is not provided by the client, we must retrieve
    // the connection to get its sourceSystem and use it for creating token.
    const parsedGetIntegrationConnectionParams =
      GetIntegrationConnectionSchema.parse({
        id: params.connectionId,
        laboratoryId,
      });

    const connection = await getIntegrationConnection(
      tx,
      parsedGetIntegrationConnectionParams,
    );

    const parsedCreateIntegrationTokenParams =
      CreateIntegrationTokenSchema.parse({
        ...params,
        sourceSystem: connection?.sourceSystem,
        laboratoryId,
        createdByUserId: id,
      });

    const { integrationToken, plaintext } = await createIntegrationToken(
      tx,
      parsedCreateIntegrationTokenParams,
    );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: {
        integrationToken: {
          ...integrationToken,
          createdAt: integrationToken.createdAt.toISOString(),
          updatedAt: integrationToken.updatedAt.toISOString(),
          expiresAt: integrationToken.expiresAt?.toISOString(),
          revokedAt: integrationToken.revokedAt?.toISOString(),
          lastUsedAt: integrationToken.lastUsedAt?.toISOString(),
        },
        plaintext,
      },
    };
  });
}

export async function getIntegrationTokensAction(
  params: z.infer<typeof GetIntegrationTokensActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_TOKEN:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view integration tokens.",
    );
  }

  const { laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    const parsedGetIntegrationTokensParams = GetIntegrationTokensSchema.parse({
      ...params,
      laboratoryId,
    });

    const [integrationTokens, paginationMeta] = await getIntegrationTokens(
      tx,
      parsedGetIntegrationTokensParams,
    );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: integrationTokens.map((integrationToken) => ({
        ...integrationToken,
        createdAt: integrationToken.createdAt.toISOString(),
        updatedAt: integrationToken.updatedAt.toISOString(),
        expiresAt: integrationToken.expiresAt?.toISOString(),
        revokedAt: integrationToken.revokedAt?.toISOString(),
        lastUsedAt: integrationToken.lastUsedAt?.toISOString(),
      })),
      pagination: paginationMeta,
    };
  });
}

export async function getIntegrationTokenAction(
  params: z.infer<typeof GetIntegrationTokenActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_TOKEN:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this integration token.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetIntegrationTokenParams = GetIntegrationTokenSchema.parse({
    ...params,
    laboratoryId,
  });

  const integrationToken = await getIntegrationToken(
    prisma,
    parsedGetIntegrationTokenParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: integrationToken
      ? {
          ...integrationToken,
          createdAt: integrationToken.createdAt.toISOString(),
          updatedAt: integrationToken.updatedAt.toISOString(),
          expiresAt: integrationToken.expiresAt?.toISOString(),
          revokedAt: integrationToken.revokedAt?.toISOString(),
          lastUsedAt: integrationToken.lastUsedAt?.toISOString(),
        }
      : null,
  };
}

export async function revokeIntegrationTokenAction(
  params: z.infer<typeof RevokeIntegrationTokenActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_TOKEN:REVOKE")) {
    throw new UnauthorizedError(
      "You don't have permission to revoke this integration token.",
    );
  }

  const { id, laboratoryId } = user;

  const integrationToken = await prisma.$transaction(async (tx) => {
    // Make sure the token is found and has not revoked yet.
    const parsedGetIntegrationTokenParams = GetIntegrationTokenSchema.parse({
      ...params,
      laboratoryId,
    });

    const existingIntegrationToken = await getIntegrationToken(
      tx,
      parsedGetIntegrationTokenParams,
    );

    if (!existingIntegrationToken) {
      throw new Error("Token not found");
    }
    if (existingIntegrationToken.revokedAt) {
      throw new Error("Token is already revoked");
    }

    const parsedRevokeIntegrationTokenParams =
      RevokeIntegrationTokenSchema.parse({
        ...params,
        laboratoryId,
        revokedByUserId: id,
      });

    return await revokeIntegrationToken(tx, parsedRevokeIntegrationTokenParams);
  });

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...integrationToken,
      createdAt: integrationToken.createdAt.toISOString(),
      updatedAt: integrationToken.updatedAt.toISOString(),
      expiresAt: integrationToken.expiresAt?.toISOString(),
      revokedAt: integrationToken.revokedAt?.toISOString(),
      lastUsedAt: integrationToken.lastUsedAt?.toISOString(),
    },
  };
}

export async function rotateIntegrationTokenAction(
  params: z.infer<typeof RotateIntegrationTokenActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_TOKEN:ROTATE")) {
    throw new UnauthorizedError(
      "You don't have permission to rotate this integration token.",
    );
  }

  const { id, laboratoryId } = user;

  return await prisma.$transaction(async (tx) => {
    // Make sure the token is found and has not revoked yet.
    const parsedGetIntegrationTokenParams = GetIntegrationTokenSchema.parse({
      ...params,
      laboratoryId,
    });

    const existingIntegrationToken = await getIntegrationToken(
      tx,
      parsedGetIntegrationTokenParams,
    );

    if (!existingIntegrationToken) {
      throw new Error("Token not found");
    }
    if (existingIntegrationToken.revokedAt) {
      throw new Error("Token is already revoked");
    }

    const parsedRotateIntegrationTokenParams =
      RotateIntegrationTokenSchema.parse({
        ...params,
        laboratoryId,
        rotatedByUserId: id,
      });

    // If expiresAt is not provided, use the old expiresAt value.
    const expiresAt = parsedRotateIntegrationTokenParams.expiresAt
      ? parsedRotateIntegrationTokenParams.expiresAt
      : existingIntegrationToken.expiresAt;

    // Revoke the old token and create a new one.
    // It doesn't matter which one will be executed first.
    const [revokedToken, { integrationToken: newToken, plaintext }] =
      await Promise.all([
        revokeIntegrationToken(tx, {
          id: parsedRotateIntegrationTokenParams.id,
          laboratoryId: parsedRotateIntegrationTokenParams.laboratoryId,
          revokedByUserId: parsedRotateIntegrationTokenParams.rotatedByUserId,
        }),
        createIntegrationToken(tx, {
          name: existingIntegrationToken.name,
          expiresAt,
          connectionId: existingIntegrationToken.connection.id,
          laboratoryId: parsedRotateIntegrationTokenParams.laboratoryId,
          sourceSystem: existingIntegrationToken.connection.sourceSystem,
          createdByUserId: parsedRotateIntegrationTokenParams.rotatedByUserId,
        }),
      ]);

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      revokedToken: {
        ...revokedToken,
        createdAt: revokedToken.createdAt.toISOString(),
        updatedAt: revokedToken.updatedAt.toISOString(),
        expiresAt: revokedToken.expiresAt?.toISOString(),
        revokedAt: revokedToken.revokedAt?.toISOString(),
        lastUsedAt: revokedToken.lastUsedAt?.toISOString(),
      },
      newToken: {
        ...newToken,
        createdAt: newToken.createdAt.toISOString(),
        updatedAt: newToken.updatedAt.toISOString(),
        expiresAt: newToken.expiresAt?.toISOString(),
        revokedAt: newToken.revokedAt?.toISOString(),
        lastUsedAt: newToken.lastUsedAt?.toISOString(),
      },
      plaintext,
    };
  });
}
