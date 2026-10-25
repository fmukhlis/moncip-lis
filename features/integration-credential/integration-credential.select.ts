import { Prisma } from "@/generated/prisma";
import { integrationConnectionBaseSelect } from "../integration-connection/integration-connection.base-select";

export const integrationCredentialBaseSelect = {
  id: true,
  name: true,
  secretPrefix: true,
  laboratoryId: true,
  createdByUserId: true,
  encryptedSecret: true,
  revokedByUserId: true,
} satisfies Prisma.IntegrationCredentialSelect;

export const integrationCredentialListSelect = {
  ...integrationCredentialBaseSelect,
  createdAt: true,
  expiresAt: true,
  revokedAt: true,
  updatedAt: true,
  lastUsedAt: true,
  connection: { select: integrationConnectionBaseSelect },
} satisfies Prisma.IntegrationCredentialSelect;

export const integrationCredentialDetailSelect = {
  ...integrationCredentialBaseSelect,
  createdAt: true,
  expiresAt: true,
  revokedAt: true,
  updatedAt: true,
  lastUsedAt: true,
  connection: {
    select: { ...integrationConnectionBaseSelect },
  },
} satisfies Prisma.IntegrationCredentialSelect;
