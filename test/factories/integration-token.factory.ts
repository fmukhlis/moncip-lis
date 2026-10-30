import crypto from "crypto";
import { TOKEN_PREFIX_STORED_LENGTH } from "@/features/integration-token/integration-token.helper";

/**
 * Builds the row an `IntegrationToken` insert needs, together with the
 * plaintext that would have been handed to the HIS. Tests that call the public
 * HTTP surface need the plaintext, which is exactly what the application never
 * stores, so it has to be manufactured here.
 */
export function makeIntegrationTokenRecord({
  connectionId,
  laboratoryId,
  name = "HIS test token",
  sourceSystem = "HIS",
  expiresAt = null,
  revokedAt = null,
  createdByUserId = null,
  plaintext = `moncip_${sourceSystem.toLowerCase()}_${crypto.randomBytes(32).toString("hex")}`,
}: {
  connectionId: string;
  laboratoryId: string;
  name?: string;
  sourceSystem?: string;
  expiresAt?: Date | null;
  revokedAt?: Date | null;
  createdByUserId?: string | null;
  plaintext?: string;
}) {
  return {
    plaintext,
    data: {
      name,
      expiresAt,
      revokedAt,
      connectionId,
      laboratoryId,
      createdByUserId,
      tokenHash: crypto.createHash("sha256").update(plaintext).digest("hex"),
      tokenPrefix: plaintext.slice(0, TOKEN_PREFIX_STORED_LENGTH),
    },
  };
}
