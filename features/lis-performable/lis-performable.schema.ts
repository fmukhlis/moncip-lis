import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";
import { LisPerformableType } from "@/generated/prisma";

export const CreateLisPerformableActionSchema = z.object({
  type: z.enum(LisPerformableType),
  isActive: z.boolean(),
  displayName: z.string().trim().min(1).max(50),
  specimenTypes: z
    .array(
      z.object({ id: requiredCuid2("Specimen Type"), isDefault: z.boolean() }),
    )
    .min(1),
  departmentId: requiredCuid2("Department"),
  externalOrderableId: requiredCuid2("External Orderable"),
});

export const CreateLisPerformableSchema =
  CreateLisPerformableActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetLisPerformablesActionSchema = z.object({
  ...PaginationSchema.shape,
  type: z.enum(LisPerformableType).optional(),
  search: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  departmentId: requiredCuid2("Department").optional(),
});

export const GetLisPerformablesSchema = GetLisPerformablesActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const GetLisPerformableActionSchema = z.object({
  id: requiredCuid2("LIS Performable"),
});

export const GetLisPerformableSchema = GetLisPerformableActionSchema.extend({
  laboratoryId: requiredCuid2("Laboratory"),
});

export const UpdateLisPerformableActionSchema =
  CreateLisPerformableActionSchema.partial()
    .omit({ externalOrderableId: true })
    .safeExtend({
      id: requiredCuid2("LIS Performable"),
    });

export const UpdateLisPerformableSchema =
  UpdateLisPerformableActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });
