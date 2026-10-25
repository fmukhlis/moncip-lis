"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  getIntegrationCredential,
  getIntegrationCredentials,
  revokeIntegrationCredential,
  createIntegrationCredential,
} from "./integration-credential.service";
import {
  GetIntegrationCredentialSchema,
  GetIntegrationCredentialsSchema,
  CreateIntegrationCredentialSchema,
  RevokeIntegrationCredentialSchema,
  RotateIntegrationCredentialSchema,
  GetIntegrationCredentialActionSchema,
  GetIntegrationCredentialsActionSchema,
  CreateIntegrationCredentialActionSchema,
  RevokeIntegrationCredentialActionSchema,
  RotateIntegrationCredentialActionSchema,
} from "./integration-credential.schema";

export async function createIntegrationCredentialAction(
  params: z.infer<typeof CreateIntegrationCredentialActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_CREDENTIAL:CREATE")) {
    throw new UnauthorizedError(
      "You don't have permission to create an integration credential.",
    );
  }

  const { id, laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    // Create the credential.
    const parsedCreateIntegrationCredentialParams =
      CreateIntegrationCredentialSchema.parse({
        ...params,
        laboratoryId,
        createdByUserId: id,
      });

    const integrationCredential = await createIntegrationCredential(
      tx,
      parsedCreateIntegrationCredentialParams,
    );

    return {
      data: {
        ...integrationCredential,
        createdAt: integrationCredential.createdAt.toISOString(),
        updatedAt: integrationCredential.updatedAt.toISOString(),
        expiresAt: integrationCredential.expiresAt?.toISOString(),
        revokedAt: integrationCredential.revokedAt?.toISOString(),
        lastUsedAt: integrationCredential.lastUsedAt?.toISOString(),
      },
    };
  });
}

export async function getIntegrationCredentialsAction(
  params: z.infer<typeof GetIntegrationCredentialsActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_CREDENTIAL:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view integration credentials.",
    );
  }

  const { laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    const parsedGetIntegrationCredentialsParams =
      GetIntegrationCredentialsSchema.parse({
        ...params,
        laboratoryId,
      });

    const [integrationCredentials, paginationMeta] =
      await getIntegrationCredentials(
        tx,
        parsedGetIntegrationCredentialsParams,
      );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: integrationCredentials.map((integrationCredential) => ({
        ...integrationCredential,
        createdAt: integrationCredential.createdAt.toISOString(),
        updatedAt: integrationCredential.updatedAt.toISOString(),
        expiresAt: integrationCredential.expiresAt?.toISOString(),
        revokedAt: integrationCredential.revokedAt?.toISOString(),
        lastUsedAt: integrationCredential.lastUsedAt?.toISOString(),
      })),
      pagination: paginationMeta,
    };
  });
}

export async function getIntegrationCredentialAction(
  params: z.infer<typeof GetIntegrationCredentialActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_CREDENTIAL:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this integration credential.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetIntegrationCredentialParams =
    GetIntegrationCredentialSchema.parse({
      ...params,
      laboratoryId,
    });

  const integrationCredential = await getIntegrationCredential(
    prisma,
    parsedGetIntegrationCredentialParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: integrationCredential
      ? {
          ...integrationCredential,
          createdAt: integrationCredential.createdAt.toISOString(),
          updatedAt: integrationCredential.updatedAt.toISOString(),
          expiresAt: integrationCredential.expiresAt?.toISOString(),
          revokedAt: integrationCredential.revokedAt?.toISOString(),
          lastUsedAt: integrationCredential.lastUsedAt?.toISOString(),
        }
      : null,
  };
}

export async function revokeIntegrationCredentialAction(
  params: z.infer<typeof RevokeIntegrationCredentialActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_CREDENTIAL:REVOKE")) {
    throw new UnauthorizedError(
      "You don't have permission to revoke this integration credential.",
    );
  }

  const { id, laboratoryId } = user;

  const parsedRevokeIntegrationCredentialParams =
    RevokeIntegrationCredentialSchema.parse({
      ...params,
      laboratoryId,
      revokeByUserId: id,
    });

  const integrationCredential = await revokeIntegrationCredential(
    prisma,
    parsedRevokeIntegrationCredentialParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...integrationCredential,
      createdAt: integrationCredential.createdAt.toISOString(),
      updatedAt: integrationCredential.updatedAt.toISOString(),
      expiresAt: integrationCredential.expiresAt?.toISOString(),
      revokedAt: integrationCredential.revokedAt?.toISOString(),
      lastUsedAt: integrationCredential.lastUsedAt?.toISOString(),
    },
  };
}

export async function rotateIntegrationCredentialAction(
  params: z.infer<typeof RotateIntegrationCredentialActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INTEGRATION_CREDENTIAL:ROTATE")) {
    throw new UnauthorizedError(
      "You don't have permission to rotate this integration credential.",
    );
  }

  const { id: rotatedByUserId, laboratoryId } = user;

  return await prisma.$transaction(async (tx) => {
    // Make sure credential is found and has not revoked yet.
    const parsedGetIntegrationCredentialParams =
      GetIntegrationCredentialSchema.parse({
        ...params,
        laboratoryId,
      });

    const existingIntegrationCredential = await getIntegrationCredential(
      tx,
      parsedGetIntegrationCredentialParams,
    );

    if (!existingIntegrationCredential) {
      throw new Error("Credential not found");
    }
    if (existingIntegrationCredential.revokedAt) {
      throw new Error("Credential is already revoked");
    }

    const parsedRotateIntegrationCredentialParams =
      RotateIntegrationCredentialSchema.parse({
        ...params,
        laboratoryId,
        rotatedByUserId,
      });

    // If expiresAt is not provided, use the old expiresAt value.
    const expiresAt = parsedRotateIntegrationCredentialParams.expiresAt
      ? parsedRotateIntegrationCredentialParams.expiresAt
      : existingIntegrationCredential.expiresAt;

    // Revoke the old credential and create a new one.
    // It doesn't matter which one will be executed first.
    const [revokedCredential, newCredential] = await Promise.all([
      revokeIntegrationCredential(tx, {
        id: parsedRotateIntegrationCredentialParams.id,
        laboratoryId: parsedRotateIntegrationCredentialParams.laboratoryId,
        revokedByUserId:
          parsedRotateIntegrationCredentialParams.rotatedByUserId,
      }),
      createIntegrationCredential(tx, {
        name: existingIntegrationCredential.name,
        secret: parsedRotateIntegrationCredentialParams.secret,
        expiresAt,
        connectionId: existingIntegrationCredential.connection.id,
        laboratoryId: parsedRotateIntegrationCredentialParams.laboratoryId,
        createdByUserId:
          parsedRotateIntegrationCredentialParams.rotatedByUserId,
      }),
    ]);

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      revokedCredential: {
        ...revokedCredential,
        createdAt: revokedCredential.createdAt.toISOString(),
        updatedAt: revokedCredential.updatedAt.toISOString(),
        expiresAt: revokedCredential.expiresAt?.toISOString(),
        revokedAt: revokedCredential.revokedAt?.toISOString(),
        lastUsedAt: revokedCredential.lastUsedAt?.toISOString(),
      },
      newCredential: {
        ...newCredential,
        createdAt: newCredential.createdAt.toISOString(),
        updatedAt: newCredential.updatedAt.toISOString(),
        expiresAt: newCredential.expiresAt?.toISOString(),
        revokedAt: newCredential.revokedAt?.toISOString(),
        lastUsedAt: newCredential.lastUsedAt?.toISOString(),
      },
    };
  });
}
