import { Prisma } from "@/generated/prisma";
import { departmentBaseSelect } from "../department/department.base-select";
import { specimenTypeBaseSelect } from "../specimen-type/specimen-type.select";
import { lisPerformableBaseSelect } from "../lis-performable/lis-performable.select";
import { integrationConnectionBaseSelect } from "../integration-connection/integration-connection.base-select";

export const storedExternalLabOrderableBaseSelect = {
  id: true,
  type: true,
  isActive: true,
  categoryCode: true,
  externalCode: true,
  sourceSystem: true,
  categoryDisplay: true,
  externalDisplay: true,
} satisfies Prisma.ExternalLabOrderableSelect;

export const storedExternalLabOrderableListSelect = {
  ...storedExternalLabOrderableBaseSelect,
  createdAt: true,
  updatedAt: true,
  lastSyncedAt: true,
  performables: {
    select: {
      ...lisPerformableBaseSelect,
      department: { select: departmentBaseSelect },
    },
  },
} satisfies Prisma.ExternalLabOrderableSelect;

export const storedExternalLabOrderableDetailSelect = {
  ...storedExternalLabOrderableBaseSelect,
  createdAt: true,
  updatedAt: true,
  lastSyncedAt: true,
  connection: { select: { ...integrationConnectionBaseSelect } },
  externalCodeSystem: true,
  rawCatalogSnapshot: true,
  externalOrderableId: true,
  performables: {
    select: {
      ...lisPerformableBaseSelect,
      department: { select: departmentBaseSelect },
      specimenTypes: {
        select: {
          isDefault: true,
          specimenType: { select: specimenTypeBaseSelect },
        },
      },
      _count: {
        select: {
          resultComponents: true,
        },
      },
    },
    orderBy: {
      displayName: "asc",
    },
  },
} satisfies Prisma.ExternalLabOrderableSelect;
