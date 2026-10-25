import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";

export const GetUnitsActionSchema = z.object({
  search: z.string().trim().optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((v) => v === "true"),
    ])
    .optional(),
  ...PaginationSchema.shape,
});

export const GetUnitsSchema = GetUnitsActionSchema;

export const GetUnitActionSchema = z.object({
  id: requiredCuid2("Unit"),
});

export const GetUnitSchema = GetUnitActionSchema;
