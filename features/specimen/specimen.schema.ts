import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import {
  SpecimenStatus,
  SpecimenRejectionReason,
  SpecimenCancellationReason,
} from "@/generated/prisma";

export const ReserveSpecimenNoSchema = z.object({
  date: z.coerce.date(),
});

export const CreateSpecimenActionSchema = z.object({
  patientId: requiredCuid2("Patient"),
  labOrderId: requiredCuid2("Lab Order"),
  orderItemIds: z.array(requiredCuid2("Order Item")).min(1),
  specimenTypeId: requiredCuid2("Specimen Type"),
});

export const CreateSpecimenSchema = CreateSpecimenActionSchema.extend({
  no: z.string().trim().min(1),
  period: z.string().trim().min(1),
  sequence: z.int().positive(),
  laboratoryId: requiredCuid2("Laboratory"),
});

export const GetSpecimenActionSchema = z.object({
  id: requiredCuid2("Specimen"),
});

export const GetSpecimenSchema = GetSpecimenActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const UpdateSpecimenActionSchema = z
  .object({
    id: requiredCuid2("Specimen"),
    note: z.string().trim().min(1).optional(),
    status: z.enum(SpecimenStatus).optional(),
    receivedAt: z.coerce.date().optional(),
    collectedAt: z.coerce.date().optional(),
    rejectionReason: z.enum(SpecimenRejectionReason).optional(),
    additionalReason: z.string().trim().min(1).optional(),
    cancellationReason: z.enum(SpecimenCancellationReason).optional(),
    ...CreateSpecimenActionSchema.pick({ labOrderId: true }).shape,
    ...CreateSpecimenActionSchema.pick({ specimenTypeId: true }).partial()
      .shape,
    orderItemIds: z.array(requiredCuid2("Order Item")).min(1).optional(),
  })
  .refine((data) => {
    const hasOrderItemIds = data.orderItemIds !== undefined;
    const hasSpecimenTypeId = data.specimenTypeId !== undefined;

    return hasOrderItemIds === hasSpecimenTypeId;
  });

export const UpdateSpecimenSchema = UpdateSpecimenActionSchema.safeExtend({
  rejectedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional(),
  laboratoryId: requiredCuid2("Laboratory"),
});

// Allow a small clock skew between the browser and the server.
const COLLECTED_AT_FUTURE_TOLERANCE_MS = 60_000;

const collectedAtSchema = z.coerce
  .date()
  .refine((date) => date.getTime() > 0, "Collection time is invalid.")
  .refine(
    (date) => date.getTime() <= Date.now() + COLLECTED_AT_FUTURE_TOLERANCE_MS,
    "Collection time cannot be in the future.",
  );

export const CollectSpecimenActionSchema = z.object({
  id: requiredCuid2("Specimen"),
  labOrderId: requiredCuid2("Lab Order"),
  collectedAt: collectedAtSchema,
  collectedById: requiredCuid2("Collector"),
  note: z
    .string()
    .trim()
    .max(500, "Note must be at most 500 characters.")
    .optional(),
});

export const CollectSpecimenSchema = CollectSpecimenActionSchema.safeExtend({
  laboratoryId: requiredCuid2("Laboratory"),
});
