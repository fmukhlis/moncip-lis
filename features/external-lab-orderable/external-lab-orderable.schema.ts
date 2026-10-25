import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";
import { IntegrationAuthType } from "@/generated/prisma";

export const SyncExternalLabOrderablesActionSchema = z.object({
  credentialId: requiredCuid2("Credential"),
});

export const SyncExternalLabOrderablesSchema =
  SyncExternalLabOrderablesActionSchema.extend({
    connectionId: requiredCuid2("Connection"),
  });

export const GetExternalLabOrderablesSchema = z.object({
  type: z.enum(IntegrationAuthType),
  secret: z.string().trim().min(1),
  baseUrl: z.string().trim().min(1),
});

export const GetStoredExternalLabOrderablesActionSchema = z.object({
  search: z.string().optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((v) => v === "true"),
    ])
    .optional(),
  sourceSystem: z.string().optional(),
  ...PaginationSchema.shape,
});

export const GetStoredExternalLabOrderablesSchema =
  GetStoredExternalLabOrderablesActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetStoredExternalLabOrderableActionSchema = z.object({
  id: requiredCuid2("Stored External Lab Orderable"),
});

export const GetStoredExternalLabOrderableSchema =
  GetStoredExternalLabOrderableActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const UpsertExternalLabOrderablesSchema = z.object({
  items: z.array(
    z.object({
      code: z.string().trim().min(1),
      type: z.enum(["TEST", "PANEL"]),
      status: z.enum(["ACTIVE", "INACTIVE"]),
      display: z.string().trim().min(1),
      category: z
        .object({
          code: z.string().min(1),
          display: z.string().min(1),
        })
        .optional(),
      codeSystem: z.string().trim().min(1),
      orderableId: z.string().trim().min(1),
      defaultSpecimen: z
        .object({
          typeCode: z.string().min(1),
          typeDisplay: z.string().min(1),
        })
        .optional(),
    }),
  ),
  connectionId: requiredCuid2("Connection"),
  laboratoryId: requiredCuid2("Laboratory"),
  sourceSystem: z.string().trim().min(1),
});
