"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { computePayloadHash } from "./outbound-integration-event.helper";
import { OutboundIntegrationEventStatus, Prisma } from "@/generated/prisma";
import {
  outboundIntegrationEventListSelect,
  outboundIntegrationEventDetailSelect,
} from "./outbound-integration-event.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  GetOutboundIntegrationEventSchema,
  GetOutboundIntegrationEventsSchema,
  CancelOutboundIntegrationEventSchema,
  CreateOutboundIntegrationEventSchema,
  MarkOutboundIntegrationEventAsSentSchema,
  MarkOutboundIntegrationEventAsFailedSchema,
  MarkOutboundIntegrationEventAsSendingSchema,
  MarkOutboundIntegrationEventAsAcknowledgedSchema,
} from "./outbound-integration-event.schema";

type DatabaseClient = typeof prisma;

export async function createOutboundIntegrationEvent(
  db: Pick<DatabaseClient, "outboundIntegrationEvent">,
  {
    eventType,
    messageId,
    labOrderId,
    nextRetryAt,
    connectionId,
    credentialId,
    laboratoryId,
    targetSystem,
    idempotencyKey,
    requestPayload,
    externalOrderId,
  }: z.infer<typeof CreateOutboundIntegrationEventSchema>,
) {
  const requestPayloadHash = computePayloadHash(requestPayload);

  return db.outboundIntegrationEvent.create({
    data: {
      status: OutboundIntegrationEventStatus.QUEUED,
      queuedAt: new Date(),
      eventType,
      messageId,
      labOrderId,
      nextRetryAt,
      connectionId,
      credentialId,
      laboratoryId,
      targetSystem,
      idempotencyKey,
      requestPayload,
      externalOrderId,
      requestPayloadHash,
    },
    select: outboundIntegrationEventDetailSelect,
  });
}

export async function getOutboundIntegrationEvents(
  db: Pick<DatabaseClient, "outboundIntegrationEvent">,
  {
    to,
    from,
    page,
    status,
    pageSize,
    eventType,
    labOrderId,
    connectionId,
    laboratoryId,
    targetSystem,
  }: z.infer<typeof GetOutboundIntegrationEventsSchema>,
) {
  const where: Prisma.OutboundIntegrationEventWhereInput = { laboratoryId };

  if (status) where.status = { in: status };
  if (eventType) where.eventType = { in: eventType };
  if (from || to) {
    where.queuedAt = {
      ...(from && { gte: from }),
      ...(to && { lte: to }),
    };
  }
  if (labOrderId) where.labOrderId = labOrderId;
  if (connectionId) where.connectionId = connectionId;
  if (targetSystem) where.targetSystem = targetSystem;

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const outboundIntegrationEvents = await db.outboundIntegrationEvent.findMany({
    where,
    select: outboundIntegrationEventListSelect,
    orderBy: { queuedAt: "desc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.outboundIntegrationEvent.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [outboundIntegrationEvents, paginationMeta] as const;
}

export async function getOutboundIntegrationEvent(
  db: Pick<DatabaseClient, "outboundIntegrationEvent">,
  { id, laboratoryId }: z.infer<typeof GetOutboundIntegrationEventSchema>,
) {
  return db.outboundIntegrationEvent.findFirst({
    where: { id, laboratoryId },
    select: outboundIntegrationEventDetailSelect,
  });
}

export async function markOutboundIntegrationEventAsSending(
  db: Pick<DatabaseClient, "outboundIntegrationEvent">,
  {
    id,
    laboratoryId,
  }: z.infer<typeof MarkOutboundIntegrationEventAsSendingSchema>,
): Promise<boolean> {
  const result = await db.outboundIntegrationEvent.updateMany({
    where: {
      id,
      status: OutboundIntegrationEventStatus.QUEUED,
      laboratoryId,
    },
    data: {
      status: OutboundIntegrationEventStatus.SENDING,
      attemptCount: { increment: 1 },
      lastAttemptAt: new Date(),
    },
  });
  return result.count > 0;
}

export async function markOutboundIntegrationEventAsSent(
  db: Pick<DatabaseClient, "outboundIntegrationEvent">,
  {
    id,
    laboratoryId,
    responsePayload,
  }: z.infer<typeof MarkOutboundIntegrationEventAsSentSchema>,
) {
  const result = await db.outboundIntegrationEvent.updateMany({
    where: {
      id,
      status: OutboundIntegrationEventStatus.SENDING,
      laboratoryId,
    },
    data: {
      sentAt: new Date(),
      status: OutboundIntegrationEventStatus.SENT,
      errorCode: null,
      nextRetryAt: null,
      errorMessage: null,
      responsePayload: responsePayload ?? Prisma.JsonNull,
    },
  });
  return result.count > 0;
}

export async function markOutboundIntegrationEventAsFailed(
  db: Pick<DatabaseClient, "outboundIntegrationEvent">,
  {
    id,
    errorCode,
    errorMessage,
    laboratoryId,
  }: z.infer<typeof MarkOutboundIntegrationEventAsFailedSchema>,
) {
  const result = await db.outboundIntegrationEvent.updateMany({
    where: {
      id,
      status: OutboundIntegrationEventStatus.SENDING,
      laboratoryId,
    },
    data: {
      status: OutboundIntegrationEventStatus.FAILED,
      errorCode,
      errorMessage,
    },
  });
  return result.count > 0;
}

export async function markOutboundIntegrationEventAsAcknowledged(
  db: Pick<DatabaseClient, "outboundIntegrationEvent">,
  {
    id,
    laboratoryId,
    resultSummary,
  }: z.infer<typeof MarkOutboundIntegrationEventAsAcknowledgedSchema>,
) {
  const result = await db.outboundIntegrationEvent.updateMany({
    where: {
      id,
      status: OutboundIntegrationEventStatus.SENT,
      laboratoryId,
    },
    data: {
      status: OutboundIntegrationEventStatus.ACKNOWLEDGED,
      resultSummary,
      acknowledgedAt: new Date(),
    },
  });
  return result.count > 0;
}

export async function cancelOutboundIntegrationEvent(
  db: Pick<DatabaseClient, "outboundIntegrationEvent">,
  { id, laboratoryId }: z.infer<typeof CancelOutboundIntegrationEventSchema>,
): Promise<boolean> {
  const result = await db.outboundIntegrationEvent.updateMany({
    where: {
      id,
      status: {
        in: [
          OutboundIntegrationEventStatus.QUEUED,
          OutboundIntegrationEventStatus.FAILED,
        ],
      },
      laboratoryId,
    },
    data: {
      status: OutboundIntegrationEventStatus.CANCELLED,
      nextRetryAt: null,
    },
  });
  return result.count > 0;
}
