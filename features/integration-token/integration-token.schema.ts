import { z } from "zod";
import { requiredCuid2 } from "@/lib/custom-zod-types";
import { PaginationSchema } from "@/lib/pagination";

export const CreateIntegrationTokenActionSchema = z.object({
  name: z
    .string("Token name is required.")
    .trim()
    .min(1, "Token name cannot be empty.")
    .max(100, "Token name must be 100 characters or fewer."),
  expiresAt: z.coerce.date().nullable().optional(),
  connectionId: requiredCuid2("Connection"),
});

export const CreateIntegrationTokenSchema =
  CreateIntegrationTokenActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
    /** Used to build the token's slug prefix — should come from the parent connection. */
    sourceSystem: z.string().trim().min(1, "Source system is required."),
    createdByUserId: z.cuid2().optional(),
  });

export const GetIntegrationTokensActionSchema = z.object({
  ...PaginationSchema.shape,
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "REVOKED", "EXPIRED", "ALL"]).default("ALL"),
  connectionId: z.cuid2().optional(),
});

export const GetIntegrationTokensSchema =
  GetIntegrationTokensActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
  });

export const GetIntegrationTokenActionSchema = z.object({
  id: requiredCuid2("Token"),
});

export const GetIntegrationTokenSchema = GetIntegrationTokenActionSchema.extend(
  { laboratoryId: requiredCuid2("Laboratory") },
);

export const RevokeIntegrationTokenActionSchema = z.object({
  id: requiredCuid2("Token"),
});

export const RevokeIntegrationTokenSchema =
  RevokeIntegrationTokenActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
    revokedByUserId: requiredCuid2("User").optional(),
  });

export const RotateIntegrationTokenActionSchema = z.object({
  id: requiredCuid2("Token"),
  // Pass a new expiry date, null to remove it, or omit to inherit the current token's expiry.
  expiresAt: z.coerce.date().nullable().optional(),
});

export const RotateIntegrationTokenSchema =
  RotateIntegrationTokenActionSchema.extend({
    laboratoryId: requiredCuid2("Laboratory"),
    rotatedByUserId: z.cuid2().optional(),
  });

export const VerifyIntegrationTokenSchema = z.object({
  plaintext: z
    .string()
    .min(1, "Token cannot be empty.")
    .startsWith("lis_", "Invalid token format."),
});
