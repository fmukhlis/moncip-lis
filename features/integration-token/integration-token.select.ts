import { Prisma } from "@/generated/prisma";
import { integrationConnectionBaseSelect } from "../integration-connection/integration-connection.base-select";

export const integrationTokenBaseSelect = {
  id: true,
  name: true,
  tokenPrefix: true,
  laboratoryId: true,
  createdByUserId: true,
  revokedByUserId: true,
} satisfies Prisma.IntegrationTokenSelect;

export const integrationTokenListSelect = {
  ...integrationTokenBaseSelect,
  createdAt: true,
  expiresAt: true,
  revokedAt: true,
  updatedAt: true,
  lastUsedAt: true,
  connection: { select: { ...integrationConnectionBaseSelect } },
} satisfies Prisma.IntegrationTokenSelect;

export const integrationTokenDetailSelect = {
  ...integrationTokenBaseSelect,
  createdAt: true,
  expiresAt: true,
  revokedAt: true,
  updatedAt: true,
  lastUsedAt: true,
  connection: {
    select: {
      ...integrationConnectionBaseSelect,
      sourceSystem: true,
    },
  },
} satisfies Prisma.IntegrationTokenSelect;
