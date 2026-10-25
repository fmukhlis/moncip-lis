import { z } from "zod";
import { PaginationSchema } from "@/lib/pagination";
import { jsonObjectSchema, requiredCuid2 } from "@/lib/custom-zod-types";
import {
  IntegrationEventType,
  OutboundIntegrationEventStatus,
} from "@/generated/prisma";

export const CreateOutboundIntegrationEventSchema = z.object({
  eventType: z.enum(IntegrationEventType),
  messageId: z.string().min(1).max(255),
  labOrderId: requiredCuid2("Lab Order").nullish(),
  nextRetryAt: z.coerce.date().nullish(),
  connectionId: requiredCuid2("Connection"),
  credentialId: requiredCuid2("Credential"),
  laboratoryId: requiredCuid2("Laboratory"),
  targetSystem: z.string().min(1).max(100),
  idempotencyKey: z.string().min(1).max(255),
  requestPayload: jsonObjectSchema,
  externalOrderId: z.string().max(255).nullish(),
});

export const GetOutboundIntegrationEventsActionSchema = z.object({
  ...PaginationSchema.shape,
  to: z.coerce.date().optional(),
  from: z.coerce.date().optional(),
  status: z.array(z.enum(OutboundIntegrationEventStatus)).optional(),
  eventType: z.array(z.enum(IntegrationEventType)).optional(),
  labOrderId: requiredCuid2("Lab Order").optional(),
  connectionId: requiredCuid2("Connection").optional(),
  targetSystem: z.string().optional(),
});

export const GetOutboundIntegrationEventsSchema =
  GetOutboundIntegrationEventsActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetOutboundIntegrationEventActionSchema = z.object({
  id: requiredCuid2("Event"),
});

export const GetOutboundIntegrationEventSchema =
  GetOutboundIntegrationEventActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const MarkOutboundIntegrationEventAsSendingSchema = z.object({
  id: requiredCuid2("Event"),
  laboratoryId: requiredCuid2("Laboratory"),
});

export const MarkOutboundIntegrationEventAsSentSchema = z.object({
  id: requiredCuid2("Event"),
  laboratoryId: requiredCuid2("Laboratory"),
  responsePayload: jsonObjectSchema,
});

export const MarkOutboundIntegrationEventAsFailedSchema = z.object({
  id: requiredCuid2("Event"),
  errorCode: z.string().min(1).max(100),
  errorMessage: z.string().min(1).max(1000),
  laboratoryId: requiredCuid2("Laboratory"),
});

export const MarkOutboundIntegrationEventAsAcknowledgedSchema = z.object({
  id: requiredCuid2("Event"),
  laboratoryId: requiredCuid2("Laboratory"),
  resultSummary: jsonObjectSchema,
});

export const CancelOutboundIntegrationEventSchema = z.object({
  id: requiredCuid2("Event"),
  laboratoryId: requiredCuid2("Laboratory"),
});
