"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  getOutboundIntegrationEvent,
  getOutboundIntegrationEvents,
} from "./outbound-integration-event.service";
import {
  GetOutboundIntegrationEventSchema,
  GetOutboundIntegrationEventsSchema,
  GetOutboundIntegrationEventActionSchema,
  GetOutboundIntegrationEventsActionSchema,
} from "./outbound-integration-event.schema";

export async function getOutboundIntegrationEventsAction(
  params: z.infer<typeof GetOutboundIntegrationEventsActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "OUTBOUND_INTEGRATION_EVENT:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view outbound integration events.",
    );
  }

  const { laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    const parsedGetOutboundIntegrationEventsParams =
      GetOutboundIntegrationEventsSchema.parse({ ...params, laboratoryId });

    const [outboundIntegrationEvents, paginationMeta] =
      await getOutboundIntegrationEvents(
        tx,
        parsedGetOutboundIntegrationEventsParams,
      );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: outboundIntegrationEvents.map((outboundIntegrationEvent) => ({
        ...outboundIntegrationEvent,
        sentAt: outboundIntegrationEvent.sentAt?.toISOString(),
        queuedAt: outboundIntegrationEvent.queuedAt.toISOString(),
        nextRetryAt: outboundIntegrationEvent.nextRetryAt?.toISOString(),
        lastAttemptAt: outboundIntegrationEvent.lastAttemptAt?.toISOString(),
        acknowledgedAt: outboundIntegrationEvent.acknowledgedAt?.toISOString(),
      })),
      pagination: paginationMeta,
    };
  });
}

export async function getOutboundIntegrationEventAction(
  params: z.infer<typeof GetOutboundIntegrationEventActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "OUTBOUND_INTEGRATION_EVENT:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this outbound integration event.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetOutboundIntegrationEventParams =
    GetOutboundIntegrationEventSchema.parse({ ...params, laboratoryId });

  const outboundIntegrationEvent = await getOutboundIntegrationEvent(
    prisma,
    parsedGetOutboundIntegrationEventParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: outboundIntegrationEvent
      ? {
          ...outboundIntegrationEvent,
          sentAt: outboundIntegrationEvent.sentAt?.toISOString(),
          queuedAt: outboundIntegrationEvent.queuedAt.toISOString(),
          nextRetryAt: outboundIntegrationEvent.nextRetryAt?.toISOString(),
          lastAttemptAt: outboundIntegrationEvent.lastAttemptAt?.toISOString(),
          acknowledgedAt:
            outboundIntegrationEvent.acknowledgedAt?.toISOString(),
        }
      : null,
  };
}
