import { Prisma } from "@/generated/prisma";
import { lisPerformableBaseSelect } from "../lis-performable/lis-performable.select";
import { storedExternalLabOrderableBaseSelect } from "../external-lab-orderable/external-lab-orderable.select";

export const labOrderItemBaseSelect = {
  id: true,
  note: true,
  status: true,
  priority: true,
  sortOrder: true,
  externalOrderItemId: true,
  performableSnapshot: true,
  specimenTypeCodeSnapshot: true,
  specimenTypeDisplaySnapshot: true,
} satisfies Prisma.LabOrderItemSelect;

export const labOrderItemListSelect = {
  ...labOrderItemBaseSelect,
  createdAt: true,
  updatedAt: true,
  performable: { select: lisPerformableBaseSelect },
  externalOrderable: { select: storedExternalLabOrderableBaseSelect },
} satisfies Prisma.LabOrderItemSelect;

export const labOrderItemDetailSelect = {
  ...labOrderItemBaseSelect,
  createdAt: true,
  updatedAt: true,
  performable: { select: lisPerformableBaseSelect },
  externalOrderable: { select: storedExternalLabOrderableBaseSelect },
} satisfies Prisma.LabOrderItemSelect;
