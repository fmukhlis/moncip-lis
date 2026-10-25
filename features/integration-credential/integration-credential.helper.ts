import crypto from "crypto";
import { z } from "zod";
import { GetIntegrationCredentialsSchema } from "./integration-credential.schema";

const ALGORITHM = "aes-256-gcm";
export const CREDENTIAL_PREFIX_STORED_LENGTH = 8;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY is not set");
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32)
    throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  return buf;
}

export function encrypt(plaintext: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const encryptedSecret = [
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
  const secretPrefix = plaintext.slice(0, CREDENTIAL_PREFIX_STORED_LENGTH);

  return { encryptedSecret, secretPrefix };
}

export function decrypt(ciphertext: string) {
  const [ivHex, tagHex, encryptedHex] = ciphertext.split(":");
  if (!ivHex || !tagHex || !encryptedHex)
    throw new Error("Invalid ciphertext format");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return (
    decipher.update(Buffer.from(encryptedHex, "hex")).toString("utf8") +
    decipher.final("utf8")
  );
}

export function buildCredentialStatusFilter(
  status: z.infer<typeof GetIntegrationCredentialsSchema>["status"],
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
