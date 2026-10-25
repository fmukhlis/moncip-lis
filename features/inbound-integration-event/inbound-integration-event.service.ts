"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { computePayloadHash } from "../outbound-integration-event/outbound-integration-event.helper";
import {
  inboundIntegrationEventListSelect,
  inboundIntegrationEventDetailSelect,
} from "./inbound-integration-event.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  GetInboundIntegrationEventSchema,
  GetInboundIntegrationEventsSchema,
  CreateInboundIntegrationEventSchema,
  UpdateInboundIntegrationEventSchema,
  ValidateInboundIntegrationEventIdentifiersSchema,
} from "./inbound-integration-event.schema";

type DatabaseClient = typeof prisma;

export async function createInboundIntegrationEvent(
  db: Pick<DatabaseClient, "inboundIntegrationEvent">,
  {
    tokenId,
    labOrderId,
    connectionId,
    laboratoryId,
    requestPayload,
  }: z.infer<typeof CreateInboundIntegrationEventSchema>,
) {
  const requestPayloadHash = computePayloadHash(requestPayload);

  return db.inboundIntegrationEvent.create({
    data: {
      token: { connect: { id: tokenId } },
      status: "RECEIVED",
      labOrder: labOrderId ? { connect: { id: labOrderId } } : undefined,
      eventType: requestPayload.eventType,
      messageId: requestPayload.messageId,
      connection: { connect: { id: connectionId } },
      laboratory: { connect: { id: laboratoryId } },
      receivedAt: new Date(),
      idempotencyKey: requestPayload.idempotencyKey,
      requestPayload,
      externalOrderId: requestPayload.order.id,
      requestPayloadHash,
    },
    select: inboundIntegrationEventDetailSelect,
  });
}

export async function getInboundIntegrationEvents(
  db: Pick<DatabaseClient, "inboundIntegrationEvent">,
  {
    page,
    search,
    status,
    tokenId,
    pageSize,
    eventType,
    connectionId,
    laboratoryId,
  }: z.infer<typeof GetInboundIntegrationEventsSchema>,
) {
  const where: Prisma.InboundIntegrationEventWhereInput = {
    ...(search && {
      OR: [
        { messageId: { contains: search, mode: "insensitive" } },
        { labOrderId: { contains: search, mode: "insensitive" } },
        { idempotencyKey: { contains: search, mode: "insensitive" } },
        { externalOrderId: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(status && { status: { in: status } }),
    ...(tokenId && { tokenId }),
    ...(eventType && { eventType: { in: eventType } }),
    ...(connectionId && { connectionId }),
    laboratoryId,
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const inboundIntegrationEvents = await db.inboundIntegrationEvent.findMany({
    where,
    select: inboundIntegrationEventListSelect,
    orderBy: { createdAt: "desc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.inboundIntegrationEvent.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [inboundIntegrationEvents, paginationMeta] as const;
}

export async function getInboundIntegrationEvent(
  db: Pick<DatabaseClient, "inboundIntegrationEvent">,
  { id, laboratoryId }: z.infer<typeof GetInboundIntegrationEventSchema>,
) {
  return await db.inboundIntegrationEvent.findFirst({
    where: { id, laboratoryId },
    select: inboundIntegrationEventDetailSelect,
  });
}

export async function validateInboundIntegrationEventIdentifiers(
  db: Pick<DatabaseClient, "inboundIntegrationEvent">,
  {
    messageId,
    connectionId,
    laboratoryId,
    idempotencyKey,
  }: z.infer<typeof ValidateInboundIntegrationEventIdentifiersSchema>,
) {
  const inboundIntegrationEvents = await db.inboundIntegrationEvent.findMany({
    where: {
      connectionId,
      laboratoryId,
      OR: [
        ...(messageId ? [{ messageId }] : []),
        ...(idempotencyKey ? [{ idempotencyKey }] : []),
      ],
    },
    select: inboundIntegrationEventDetailSelect,
  });

  if (inboundIntegrationEvents.length === 0) {
    return null;
  }

  return inboundIntegrationEvents[0];
}

export async function updateInboundIntegrationEvent(
  db: Pick<DatabaseClient, "inboundIntegrationEvent">,
  {
    id,
    status,
    errorCode,
    eventType,
    messageId,
    labOrderId,
    processedAt,
    errorMessage,
    resultSummary,
    responsePayload,
  }: z.infer<typeof UpdateInboundIntegrationEventSchema>,
) {
  return db.inboundIntegrationEvent.update({
    where: { id },
    data: {
      status,
      labOrder: labOrderId ? { connect: { id: labOrderId } } : undefined,
      errorCode,
      eventType,
      messageId,
      processedAt,
      errorMessage,
      resultSummary,
      responsePayload,
    },
    select: inboundIntegrationEventDetailSelect,
  });
}
