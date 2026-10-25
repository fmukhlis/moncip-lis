import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";
import { PatientSnapshotSchema } from "../patient/patient.schema";
import {
  LabOrderStatus,
  LabOrderPriority,
  IntegrationEventType,
  InboundIntegrationEventStatus,
} from "@/generated/prisma";

export const RawOrderItemSnapshotSchema = z.object({
  id: z.string().trim().min(1),
  note: z.string().trim().min(1).optional(),
  priority: z.enum(LabOrderPriority).optional(),
  sortOrder: z.coerce.number().min(0),
  orderableId: z.string().trim().min(1),
});

export const RawOrderSnapshotSchema = z.object({
  id: z.string().trim().min(1),
  no: z.string().trim().min(1),
  status: z.enum([LabOrderStatus.CANCELLED, LabOrderStatus.ORDERED]).optional(),
  priority: z.enum(LabOrderPriority).optional(),
  orderedAt: z.coerce.date(),
  sourceSystem: z.string().trim().min(1),
});

export const EncounterSnapshotSchema = z.object({
  id: z.string().trim().min(1),
  no: z.string().trim().min(1),
  type: z.string().trim().min(1),
  status: z.string().trim().min(1),
});

export const ClinicalContextSnapshotSchema = z.object({
  clinicalNote: z.string().trim().min(1).optional(),
  clinicalIndication: z.string().trim().min(1).optional(),
});

export const OrderingProviderSnapshotSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
});

export const CreateInboundIntegrationEventSchema = z.object({
  tokenId: requiredCuid2("Token"),
  labOrderId: requiredCuid2("Lab Order").optional(),
  connectionId: requiredCuid2("Connection"),
  laboratoryId: requiredCuid2("Laboratory"),
  requestPayload: z.object({
    items: z.array(RawOrderItemSnapshotSchema).min(1),
    order: RawOrderSnapshotSchema,
    patient: PatientSnapshotSchema,
    encounter: EncounterSnapshotSchema,
    messageId: z.string().trim().min(1),
    eventType: z.enum(IntegrationEventType),
    idempotencyKey: z.string().trim().min(1),
    clinicalContext: ClinicalContextSnapshotSchema.optional(),
    orderingProvider: OrderingProviderSnapshotSchema,
  }),
});

export const GetInboundIntegrationEventsActionSchema = z.object({
  ...PaginationSchema.shape,
  search: z.string().trim().min(1).optional(),
  status: z.array(z.enum(InboundIntegrationEventStatus)).min(1).optional(),
  tokenId: requiredCuid2("Token").optional(),
  eventType: z.array(z.enum(IntegrationEventType)).min(1).optional(),
  connectionId: requiredCuid2("Connection").optional(),
});

export const GetInboundIntegrationEventsSchema =
  GetInboundIntegrationEventsActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetInboundIntegrationEventSchema = z.object({
  id: requiredCuid2("Inbound Integration Event"),
  laboratoryId: requiredCuid2("Laboratory"),
});

export const ValidateInboundIntegrationEventIdentifiersSchema = z
  .object({
    messageId: z.string().trim().min(1).optional(),
    laboratoryId: requiredCuid2("Laboratory"),
    connectionId: requiredCuid2("Connection"),
    idempotencyKey: z.string().trim().min(1).optional(),
  })
  .refine((data) => {
    return data.messageId !== undefined || data.idempotencyKey !== undefined;
  });

export const UpdateInboundIntegrationEventSchema = z.object({
  id: requiredCuid2("Inbound Integration Event"),
  status: z.enum(InboundIntegrationEventStatus).optional(),
  errorCode: z.string().trim().min(1).optional(),
  eventType: z.enum(IntegrationEventType).optional(),
  messageId: z.string().trim().min(1).optional(),
  labOrderId: requiredCuid2("Lab Order").optional(),
  processedAt: z.coerce.date().optional(),
  errorMessage: z.string().trim().min(1).optional(),
  resultSummary: z.object({}).optional(),
  responsePayload: z
    .union([
      z.object({
        data: z.object({
          labOrderId: requiredCuid2("Lab Order"),
          labOrderNo: z.string().trim().min(1),
        }),
        success: z.boolean(),
        messageId: z.string().trim().min(1),
        idempotencyKey: z.string().trim().min(1),
      }),
      z.object({
        error: z.object({
          code: z.string().trim().min(1),
          message: z.string().trim().min(1),
        }),
      }),
    ])
    .optional(),
});
