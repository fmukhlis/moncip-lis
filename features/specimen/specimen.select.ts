import { Prisma } from "@/generated/prisma";
import { specimenTypeBaseSelect } from "../specimen-type/specimen-type.select";
import { labOrderItemBaseSelect } from "../lab-order-item/lab-order-item.select";
import { lisPerformableBaseSelect } from "../lis-performable/lis-performable.select";

export const specimenBaseSelect = {
  id: true,
  no: true,
  note: true,
  period: true,
  status: true,
  sequence: true,
  rejectionReason: true,
  cancellationReason: true,
} satisfies Prisma.SpecimenSelect;

export const specimenListSelect = {
  ...specimenBaseSelect,
  createdAt: true,
  receivedAt: true,
  rejectedAt: true,
  cancelledAt: true,
  collectedAt: true,
  orderItems: {
    select: {
      id: true,
      endedAt: true,
      endReason: true,
      assignedAt: true,
      labOrderItem: {
        select: {
          ...labOrderItemBaseSelect,
          performable: { select: { ...lisPerformableBaseSelect } },
        },
      },
    },
  },
  specimenType: { select: { ...specimenTypeBaseSelect } },
} satisfies Prisma.SpecimenSelect;

export const specimenDetailSelect = {
  ...specimenBaseSelect,
  createdAt: true,
  updatedAt: true,
  receivedAt: true,
  rejectedAt: true,
  cancelledAt: true,
  collectedAt: true,
  labOrderId: true,
  collectedById: true,
  collectedBy: {
    select: {
      id: true,
      name: true,
      username: true,
    },
  },
  receivedById: true,
  receivedBy: {
    select: {
      id: true,
      name: true,
      username: true,
    },
  },
  orderItems: {
    select: {
      id: true,
      endedAt: true,
      endReason: true,
      assignedAt: true,
      labOrderItem: {
        select: {
          ...labOrderItemBaseSelect,
          performable: { select: { ...lisPerformableBaseSelect } },
        },
      },
    },
  },
  specimenType: { select: { ...specimenTypeBaseSelect } },
} satisfies Prisma.SpecimenSelect;
