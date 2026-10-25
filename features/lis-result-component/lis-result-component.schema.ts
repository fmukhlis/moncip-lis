import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { ResultValueType } from "@/generated/prisma";
import { PaginationSchema } from "@/lib/pagination";

export const CreateLisResultComponentActionSchema = z.object({
  code: z.string().trim().min(1),
  unitId: requiredCuid2("Unit").optional(),
  isActive: z.boolean(),
  valueType: z.enum(ResultValueType),
  isRequired: z.boolean(),
  displayName: z.string().trim().min(1),
  decimalPlaces: z.coerce.number().min(0).max(5).optional(),
  performableId: requiredCuid2("Performable"),
});

export const CreateLisResultComponentSchema =
  CreateLisResultComponentActionSchema.extend({
    sortOrder: z.coerce.number().min(1),
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetLisResultComponentNextSortOrderSchema = z.object({
  laboratoryId: requiredCuid2("Laboratory").optional(),
  performableId: requiredCuid2("Performable").optional(),
});

export const GetLisResultComponentsActionSchema = z.object({
  ...PaginationSchema.shape,
  search: z.string().trim().optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((v) => v === "true"),
    ])
    .optional(),
  isRequired: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((v) => v === "true"),
    ])
    .optional(),
  laboratoryId: requiredCuid2("Laboratory").optional(),
  performableId: requiredCuid2("Performable").optional(),
});

export const GetLisResultComponentsSchema =
  GetLisResultComponentsActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetLisResultComponentActionSchema = z.object({
  id: requiredCuid2("Result Component"),
});

export const GetLisResultComponentSchema =
  GetLisResultComponentActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const UpdateLisResultComponentApiSchema =
  CreateLisResultComponentActionSchema.omit({ code: true })
    .partial()
    .extend({ id: requiredCuid2("Result Component") });

export const UpdateLisResultComponentActionSchema =
  UpdateLisResultComponentApiSchema.omit({
    performableId: true,
  });

export const UpdateLisResultComponentSchema =
  UpdateLisResultComponentActionSchema.extend({
    sortOrder: z.coerce.number().min(1).optional(),
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const UpdateLisResultComponentsOrderApiSchema = z.object({
  lisResultComponents: z.array(
    z.object({
      id: requiredCuid2("Result Component"),
      sortOrder: z.coerce.number().min(1),
    }),
  ),
});

export const UpdateLisResultComponentsOrderActionSchema =
  UpdateLisResultComponentsOrderApiSchema;

export const UpdateLisResultComponentsOrderSchema =
  UpdateLisResultComponentsOrderActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });
