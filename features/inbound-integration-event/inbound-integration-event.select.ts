import { Prisma } from "@/generated/prisma";
import { labOrderBaseSelect } from "../lab-order/lab-order.base-select";
import { integrationTokenBaseSelect } from "../integration-token/integration-token.select";
import { integrationConnectionBaseSelect } from "../integration-connection/integration-connection.base-select";

export const inboundIntegrationEventBaseSelect = {
  id: true,
  status: true,
  errorCode: true,
  eventType: true,
  messageId: true,
  labOrderId: true,
  errorMessage: true,
  resultSummary: true,
  idempotencyKey: true,
  requestPayload: true,
  externalOrderId: true,
  responsePayload: true,
  requestPayloadHash: true,
} satisfies Prisma.InboundIntegrationEventSelect;

export const inboundIntegrationEventListSelect = {
  ...inboundIntegrationEventBaseSelect,
  createdAt: true,
  updatedAt: true,
  receivedAt: true,
  processedAt: true,
} satisfies Prisma.InboundIntegrationEventSelect;

export const inboundIntegrationEventDetailSelect = {
  ...inboundIntegrationEventBaseSelect,
  token: { select: { ...integrationTokenBaseSelect } },
  labOrder: { select: { ...labOrderBaseSelect } },
  createdAt: true,
  updatedAt: true,
  connection: { select: { ...integrationConnectionBaseSelect } },
  receivedAt: true,
  processedAt: true,
} satisfies Prisma.InboundIntegrationEventSelect;
