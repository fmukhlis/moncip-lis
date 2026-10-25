import z from "zod";
import crypto from "crypto";
import { GetIntegrationTokensSchema } from "./integration-token.schema";

// ─── Token Generation ──────────────────────────────────────────────────────────
//
// Token anatomy:  moncip_{systemSlug}_{64 hex chars}
// Example:        moncip_his_a1b2c3d4e5f6g7h8...
//
// Only the SHA-256 hash is persisted. The plaintext is returned once at
// creation/rotation time and must never be stored.
//
// The prefix (first N chars) is stored for fast indexed lookup — it narrows
// the DB query before hash comparison, avoiding a full-table scan.

const TOKEN_NAMESPACE = "moncip";
export const TOKEN_PREFIX_STORED_LENGTH = 16;

export function buildToken(sourceSystem: string) {
  const systemSlug = sourceSystem
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 4);

  const randomPart = crypto.randomBytes(32).toString("hex"); // 64 chars
  const plaintext = `${TOKEN_NAMESPACE}_${systemSlug}_${randomPart}`;
  const prefix = plaintext.slice(0, TOKEN_PREFIX_STORED_LENGTH);
  const hash = crypto.createHash("sha256").update(plaintext).digest("hex");

  return { plaintext, hash, prefix };
}

export function buildTokenStatusFilter(
  status: z.infer<typeof GetIntegrationTokensSchema>["status"],
) {
  const now = new Date();

  switch (status) {
    case "ACTIVE":
      return {
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      };
    case "REVOKED":
      return { revokedAt: { not: null } };
    case "EXPIRED":
      return { revokedAt: null, expiresAt: { lte: now } };
    case "ALL":
    default:
      return {};
  }
}
