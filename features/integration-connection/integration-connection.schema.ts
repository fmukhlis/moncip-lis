import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";
import { IntegrationAuthType } from "@/generated/prisma";

const nameSchema = z
  .string("Name is required.")
  .trim()
  .min(1, "Name cannot be empty.")
  .max(100, "Name must be 100 characters or fewer.");

const sourceSystemSchema = z
  .string("Source system is required.")
  .trim()
  .min(1, "Source system cannot be empty.")
  .max(50, "Source system must be 50 characters or fewer.");

const baseUrlSchema = z
  .url("Base URL must be a valid URL.")
  .nullable()
  .optional();

const authTypeSchema = z.enum(
  IntegrationAuthType,
  "Invalid authentication type.",
);

// ─── Schemas ───────────────────────────────────────────────────────────────────

export const CreateIntegrationConnectionActionSchema = z.object({
  name: nameSchema,
  type: authTypeSchema,
  baseUrl: z.string().trim(),
  isActive: z.boolean().default(true),
  sourceSystem: sourceSystemSchema,
});

export const CreateIntegrationConnectionSchema =
  CreateIntegrationConnectionActionSchema.extend({
    baseUrl: z.preprocess((v) => (v ? v : null), baseUrlSchema),
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetIntegrationConnectionsActionSchema = z.object({
  ...PaginationSchema.shape,
  search: z.string().optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]).transform((v) => v === "true"),
    ])
    .optional(),
  sourceSystem: z.string().optional(),
});

export const GetIntegrationConnectionsSchema =
  GetIntegrationConnectionsActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetIntegrationConnectionActionSchema = z.object({
  id: requiredCuid2("Integration Connection"),
});

export const GetIntegrationConnectionSchema =
  GetIntegrationConnectionActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const UpdateIntegrationConnectionActionSchema = z.object({
  id: requiredCuid2("Integration connection"),
  name: z.preprocess((v) => (v !== "" ? v : undefined), nameSchema.optional()),
  type: authTypeSchema.optional(),
  baseUrl: baseUrlSchema,
  isActive: z.boolean().optional(),
});

export const UpdateIntegrationConnectionSchema =
  UpdateIntegrationConnectionActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });
