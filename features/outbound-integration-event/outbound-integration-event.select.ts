import { Prisma } from "@/generated/prisma";

const outboundIntegrationEventBaseSelect = {
  id: true,
  status: true,
  errorCode: true,
  eventType: true,
  messageId: true,
  labOrderId: true,
  attemptCount: true,
  connectionId: true,
  errorMessage: true,
  laboratoryId: true,
  targetSystem: true,
  resultSummary: true,
  idempotencyKey: true,
  externalOrderId: true,
} satisfies Prisma.OutboundIntegrationEventSelect;

export const outboundIntegrationEventListSelect = {
  ...outboundIntegrationEventBaseSelect,
  sentAt: true,
  queuedAt: true,
  nextRetryAt: true,
  lastAttemptAt: true,
  acknowledgedAt: true,
} satisfies Prisma.OutboundIntegrationEventSelect;

export const outboundIntegrationEventDetailSelect = {
  ...outboundIntegrationEventBaseSelect,
  sentAt: true,
  queuedAt: true,
  nextRetryAt: true,
  lastAttemptAt: true,
  acknowledgedAt: true,
} satisfies Prisma.OutboundIntegrationEventSelect;
