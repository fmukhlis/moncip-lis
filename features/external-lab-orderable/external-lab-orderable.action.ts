"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { decrypt } from "../integration-credential/integration-credential.helper";
import { authorize } from "../authentication/authentication.policy";
import { randomUUID } from "crypto";
import { UnauthorizedError } from "../authentication/authentication.error";
import { IntegrationEventType } from "@/generated/prisma";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  getIntegrationCredential,
  useIntegrationCredential,
} from "../integration-credential/integration-credential.service";
import { UnableToSyncOrderablesError } from "./external-lab-orderable.error";
import {
  GetIntegrationCredentialSchema,
  UseIntegrationCredentialSchema,
} from "../integration-credential/integration-credential.schema";
import { NoUsableIntegrationCredentialFoundError } from "../integration-credential/integration-credention.error";
import {
  getExternalLabOrderables,
  upsertExternalLabOrderables,
  getStoredExternalLabOrderable,
  getStoredExternalLabOrderables,
} from "./external-lab-orderable.service";
import {
  createOutboundIntegrationEvent,
  markOutboundIntegrationEventAsSent,
  markOutboundIntegrationEventAsFailed,
  markOutboundIntegrationEventAsSending,
  markOutboundIntegrationEventAsAcknowledged,
} from "../outbound-integration-event/outbound-integration-event.service";
import {
  CreateOutboundIntegrationEventSchema,
  MarkOutboundIntegrationEventAsSentSchema,
  MarkOutboundIntegrationEventAsFailedSchema,
  MarkOutboundIntegrationEventAsSendingSchema,
  MarkOutboundIntegrationEventAsAcknowledgedSchema,
} from "../outbound-integration-event/outbound-integration-event.schema";
import {
  GetExternalLabOrderablesSchema,
  UpsertExternalLabOrderablesSchema,
  GetStoredExternalLabOrderableSchema,
  GetStoredExternalLabOrderablesSchema,
  SyncExternalLabOrderablesActionSchema,
  GetStoredExternalLabOrderableActionSchema,
  GetStoredExternalLabOrderablesActionSchema,
} from "./external-lab-orderable.schema";

export async function syncExternalLabOrderablesAction(
  params: z.infer<typeof SyncExternalLabOrderablesActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "EXTERNAL_LAB_ORDERABLE:SYNC")) {
    throw new UnauthorizedError(
      "You don't have permission to sync orderables.",
    );
  }

  const { laboratoryId } = user;

  const { usableCredential, queuedOutboundIntegrationEvent } =
    await prisma.$transaction(async (tx) => {
      // Make sure the credential is usable.
      const parsedGetIntegrationCredentialParams =
        GetIntegrationCredentialSchema.parse({
          id: params.credentialId,
          onlyActive: true,
          laboratoryId,
        });

      const credential = await getIntegrationCredential(
        tx,
        parsedGetIntegrationCredentialParams,
      );

      if (!credential) {
        throw new NoUsableIntegrationCredentialFoundError(params.credentialId);
      }

      // Create outbound integration event.
      const syncRunId = randomUUID();

      const parsedCreateOutboundIntegrationEventParams =
        CreateOutboundIntegrationEventSchema.parse({
          eventType: IntegrationEventType.CATALOG_SYNC,
          messageId: syncRunId,
          connectionId: credential.connection.id,
          credentialId: credential.id,
          laboratoryId,
          targetSystem: credential.connection.sourceSystem,
          idempotencyKey: `${IntegrationEventType.CATALOG_SYNC}:${syncRunId}`,
          requestPayload: {},
        });

      const outboundIntegrationEvent = await createOutboundIntegrationEvent(
        tx,
        parsedCreateOutboundIntegrationEventParams,
      );

      // Mark the newly created outbound integration event as sending.
      const parsedMarkOutboundIntegrationEventAsSendingParams =
        MarkOutboundIntegrationEventAsSendingSchema.parse({
          id: outboundIntegrationEvent.id,
          laboratoryId,
        });

      await markOutboundIntegrationEventAsSending(
        tx,
        parsedMarkOutboundIntegrationEventAsSendingParams,
      );

      return {
        usableCredential: credential,
        queuedOutboundIntegrationEvent: outboundIntegrationEvent,
      };
    });

  try {
    // Retrieve external lab orderables from the external system.
    const parsedGetExternalLabOrderablesParams =
      GetExternalLabOrderablesSchema.parse({
        type: usableCredential.connection.type,
        secret: decrypt(usableCredential.encryptedSecret),
        baseUrl: usableCredential.connection.baseUrl,
      });

    const responsePayload = await getExternalLabOrderables(
      parsedGetExternalLabOrderablesParams,
    );

    return prisma.$transaction(async (tx) => {
      // If the retrieval is successful, mark the outbound integration event as sent.
      const parsedMarkOutboundIntegrationEventAsSentParams =
        MarkOutboundIntegrationEventAsSentSchema.parse({
          id: queuedOutboundIntegrationEvent.id,
          laboratoryId,
          responsePayload,
        });

      await markOutboundIntegrationEventAsSent(
        prisma,
        parsedMarkOutboundIntegrationEventAsSentParams,
      );

      // Upsert the external lab orderables.
      const parsedUpsertExternalLabOrderablesParams =
        UpsertExternalLabOrderablesSchema.parse({
          items: responsePayload.items,
          connectionId: usableCredential.connection.id,
          laboratoryId,
          sourceSystem: usableCredential.connection.sourceSystem,
        });

      const { created, updated } = await upsertExternalLabOrderables(
        tx,
        parsedUpsertExternalLabOrderablesParams,
      );

      // Mark the outbound integration event as acknowledged.
      const parsedMarkOutboundIntegrationEventAsAcknowledgedParams =
        MarkOutboundIntegrationEventAsAcknowledgedSchema.parse({
          id: queuedOutboundIntegrationEvent.id,
          laboratoryId,
          resultSummary: { data: { created, updated } },
        });

      await markOutboundIntegrationEventAsAcknowledged(
        tx,
        parsedMarkOutboundIntegrationEventAsAcknowledgedParams,
      );

      // Update the credential lastUsedAt with the current timestamp.
      const parsedUseIntegrationCredentialParams =
        UseIntegrationCredentialSchema.parse({
          id: params.credentialId,
          laboratoryId,
        });

      useIntegrationCredential(tx, parsedUseIntegrationCredentialParams);

      return { data: { created, updated } };
    });
  } catch {
    // If it throws, mark the outbound integration event as failed.
    const parsedMarkOutboundIntegrationEventAsFailedParams =
      MarkOutboundIntegrationEventAsFailedSchema.parse({
        id: queuedOutboundIntegrationEvent.id,
        errorCode: "SYNC_FAILED",
        errorMessage: "Failed to synchronize lab orderables",
        laboratoryId,
      });

    await markOutboundIntegrationEventAsFailed(
      prisma,
      parsedMarkOutboundIntegrationEventAsFailedParams,
    );

    throw new UnableToSyncOrderablesError(
      "Failed to synchronize lab orderables",
    );
  }
}

export async function getStoredExternalLabOrderablesAction(
  params: z.infer<typeof GetStoredExternalLabOrderablesActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "EXTERNAL_LAB_ORDERABLE:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view orderables.",
    );
  }

  const { laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    const parsedGetStoredExternalLabOrderablesParams =
      GetStoredExternalLabOrderablesSchema.parse({ ...params, laboratoryId });

    const [storedExternalLabOrderables, paginationMeta] =
      await getStoredExternalLabOrderables(
        tx,
        parsedGetStoredExternalLabOrderablesParams,
      );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: storedExternalLabOrderables.map((storedExternalLabOrderable) => ({
        ...storedExternalLabOrderable,
        createdAt: storedExternalLabOrderable.createdAt.toISOString(),
        updatedAt: storedExternalLabOrderable.updatedAt.toISOString(),
        lastSyncedAt: storedExternalLabOrderable.lastSyncedAt?.toISOString(),
      })),
      paginationMeta,
    };
  });
}

export async function getStoredExternalLabOrderableAction(
  params: z.infer<typeof GetStoredExternalLabOrderableActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "EXTERNAL_LAB_ORDERABLE:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this orderable.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetExternalLabOrderableParams =
    GetStoredExternalLabOrderableSchema.parse({ ...params, laboratoryId });

  const storedExternalLabOrderable = await getStoredExternalLabOrderable(
    prisma,
    parsedGetExternalLabOrderableParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: storedExternalLabOrderable
      ? {
          ...storedExternalLabOrderable,
          createdAt: storedExternalLabOrderable.createdAt.toISOString(),
          updatedAt: storedExternalLabOrderable.updatedAt.toISOString(),
          lastSyncedAt: storedExternalLabOrderable.lastSyncedAt?.toISOString(),
        }
      : null,
  };
}
