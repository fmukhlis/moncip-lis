import stringify from "safe-stable-stringify";
import { Prisma } from "@/generated/prisma";
import { createHash } from "crypto";

export function computePayloadHash(payload: Prisma.InputJsonValue): string {
  return createHash("sha256").update(stringify(payload)).digest("hex");
}
