"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import { getInboundIntegrationEvents } from "./inbound-integration-event.service";
import {
  GetInboundIntegrationEventsSchema,
  GetInboundIntegrationEventsActionSchema,
} from "./inbound-integration-event.schema";

export async function getInboundIntegrationEventsAction(
  params: z.infer<typeof GetInboundIntegrationEventsActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "INBOUND_INTEGRATION_EVENT:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view inbound events.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetInboundIntegrationEventsParams =
    GetInboundIntegrationEventsSchema.parse({
      ...params,
      laboratoryId,
    });

  const [inboundIntegrationEvents, paginationMeta] =
    await getInboundIntegrationEvents(
      prisma,
      parsedGetInboundIntegrationEventsParams,
    );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: inboundIntegrationEvents.map(
      ({ createdAt, updatedAt, receivedAt, processedAt, ...rest }) => ({
        ...rest,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        receivedAt: receivedAt.toISOString(),
        processedAt: processedAt?.toISOString(),
      }),
    ),
    paginationMeta,
  };
}
