import { Prisma } from "@/generated/prisma";
import { integrationTokenBaseSelect } from "../integration-token/integration-token.select";
import { integrationCredentialBaseSelect } from "../integration-credential/integration-credential.select";
import { integrationConnectionBaseSelect } from "./integration-connection.base-select";

export const integrationConnectionListSelect = {
  ...integrationConnectionBaseSelect,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      tokens: { where: { revokedAt: null, expiresAt: null } },
      credentials: { where: { revokedAt: null, expiresAt: null } },
      inboundEvents: true,
    },
  },
} satisfies Prisma.IntegrationConnectionSelect;

export const integrationConnectionDetailSelect = {
  ...integrationConnectionBaseSelect,
  createdAt: true,
  updatedAt: true,
  credentials: {
    select: {
      ...integrationCredentialBaseSelect,
      createdAt: true,
      expiresAt: true,
      revokedAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
  tokens: {
    select: {
      ...integrationTokenBaseSelect,
      createdAt: true,
      expiresAt: true,
      revokedAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
  _count: {
    select: {
      inboundEvents: true,
      externalOrderables: true,
    },
  },
} satisfies Prisma.IntegrationConnectionSelect;
