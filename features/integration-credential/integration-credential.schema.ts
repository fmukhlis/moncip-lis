import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";

export const CreateIntegrationCredentialActionSchema = z.object({
  name: z
    .string("Credential name is required.")
    .trim()
    .min(1, "Credential name cannot be empty.")
    .max(100, "Credential name must be 100 characters or fewer."),
  secret: z.string().min(8, "Credential secret must be at least 8 characters"),
  expiresAt: z.coerce.date().nullable().optional(),
  connectionId: requiredCuid2("Connection"),
});

export const CreateIntegrationCredentialSchema =
  CreateIntegrationCredentialActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
    createdByUserId: z.cuid2().optional(),
  });

export const GetIntegrationCredentialsActionSchema = z.object({
  ...PaginationSchema.shape,
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "REVOKED", "EXPIRED", "ALL"]).default("ALL"),
  connectionId: z.cuid2().optional(),
});

export const GetIntegrationCredentialsSchema =
  GetIntegrationCredentialsActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetIntegrationCredentialActionSchema = z.object({
  id: requiredCuid2("Credential"),
  onlyActive: z.boolean().default(false).optional(),
});

export const GetIntegrationCredentialSchema =
  GetIntegrationCredentialActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const RevokeIntegrationCredentialActionSchema = z.object({
  id: requiredCuid2("Credential"),
});

export const RevokeIntegrationCredentialSchema =
  RevokeIntegrationCredentialActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
    revokedByUserId: z.cuid2().optional(),
  });

export const RotateIntegrationCredentialActionSchema = z.object({
  id: requiredCuid2("Credential"),
  secret: z.string().min(8, "Credential secret must be at least 8 characters"),
  // Provide expiresAt value to set a new expiry date, null to remove it, or
  // omit to inherit the current token's expiry.
  expiresAt: z.coerce.date().nullable().optional(),
});

export const RotateIntegrationCredentialSchema =
  RotateIntegrationCredentialActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
    rotatedByUserId: z.cuid2().optional(),
  });

export const UseIntegrationCredentialSchema = z.object({
  id: requiredCuid2("Credential"),
  laboratoryId: requiredCuid2("Laboratory"),
});
