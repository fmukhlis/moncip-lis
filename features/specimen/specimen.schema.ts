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
const TIMESTAMP_FUTURE_TOLERANCE_MS = 60_000;

/** A past-or-now timestamp, used by the collection and receipt records. */
function pastTimestampSchema(timeLabel: string) {
  return z.coerce
    .date()
    .refine((date) => date.getTime() > 0, `${timeLabel} is invalid.`)
    .refine(
      (date) => date.getTime() <= Date.now() + TIMESTAMP_FUTURE_TOLERANCE_MS,
      `${timeLabel} cannot be in the future.`,
    );
}

const collectedAtSchema = pastTimestampSchema("Collection time");
const receivedAtSchema = pastTimestampSchema("Received time");

/**
 * The free-text note that is shared by the collection and the receipt records.
 * An empty string is valid on purpose, because the services use it to clear the
 * stored note, while an omitted note leaves it untouched.
 */
const specimenNoteSchema = z
  .string()
  .trim()
  .max(500, "Note must be at most 500 characters.")
  .optional();

export const CollectSpecimenActionSchema = z.object({
  id: requiredCuid2("Specimen"),
  labOrderId: requiredCuid2("Lab Order"),
  collectedAt: collectedAtSchema,
  collectedById: requiredCuid2("Collector"),
  note: specimenNoteSchema,
});

export const CollectSpecimenSchema = CollectSpecimenActionSchema.safeExtend({
  laboratoryId: requiredCuid2("Laboratory"),
});

/**
 * The receipt record carries the received time and the receiving personnel, so
 * receiving a specimen and updating its receipt record share the same payload.
 * The note is the specimen note that the collection record also writes, which
 * lets the receiver keep, extend, rewrite or clear it.
 */
export const SpecimenReceiptActionSchema = z.object({
  id: requiredCuid2("Specimen"),
  labOrderId: requiredCuid2("Lab Order"),
  receivedAt: receivedAtSchema,
  receivedById: requiredCuid2("Receiver"),
  note: specimenNoteSchema,
});

export const SpecimenReceiptSchema = SpecimenReceiptActionSchema.safeExtend({
  laboratoryId: requiredCuid2("Laboratory"),
});
