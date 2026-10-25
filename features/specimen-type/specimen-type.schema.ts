import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";

export const GetSpecimenTypesActionSchema = z.object({
  ...PaginationSchema.shape,
  search: z.string().optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((v) => v === "true"),
    ])
    .optional(),
});

export const GetSpecimenTypesSchema = GetSpecimenTypesActionSchema;

export const GetSpecimenTypeActionSchema = z.object({
  id: requiredCuid2("Specimen Type"),
});

export const GetSpecimenTypeSchema = GetSpecimenTypeActionSchema;
