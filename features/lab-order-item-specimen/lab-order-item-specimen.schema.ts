import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { SpecimenAssignmentEndReason } from "@/generated/prisma";

export const CreateLabOrderItemSpecimenSchema = z.object({
  specimenId: requiredCuid2("Specimen"),
  laboratoryId: requiredCuid2("Laboratory"),
  labOrderItemId: requiredCuid2("Lab Order Item"),
});

export const UpdateLabOrderItemSpecimenSchema = z.object({
  ...CreateLabOrderItemSpecimenSchema.shape,
  endReason: z.enum(SpecimenAssignmentEndReason).optional(),
});

export const UpdateManyLabOrderItemSpecimenSchema = z
  .object({
    ...CreateLabOrderItemSpecimenSchema.pick({
      specimenId: true,
      laboratoryId: true,
    }).shape,
    endedAt: z.coerce.date().optional(),
    endReason: z.enum(SpecimenAssignmentEndReason).optional(),
    onlyActive: z.boolean().optional(),
    excludedLabOrderItemIds: z
      .array(requiredCuid2("Lab Order Item"))
      .optional(),
  })
  .refine((data) => {
    // If the end reason is specified, endedAt field must be provided.
    return data.endReason ? data.endedAt : true;
  });
