import { Prisma } from "@/generated/prisma";

export const integrationConnectionBaseSelect = {
  id: true,
  name: true,
  type: true,
  baseUrl: true,
  isActive: true,
  laboratoryId: true,
  sourceSystem: true,
} satisfies Prisma.IntegrationConnectionSelect;
