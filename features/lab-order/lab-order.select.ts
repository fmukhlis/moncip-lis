import { Prisma } from "@/generated/prisma";
import { patientBaseSelect } from "../patient/patient.select";
import { specimenBaseSelect } from "../specimen/specimen.select";
import { labOrderBaseSelect } from "./lab-order.base-select";
import { labOrderItemBaseSelect } from "../lab-order-item/lab-order-item.select";
import { inboundIntegrationEventListSelect } from "../inbound-integration-event/inbound-integration-event.select";

export const labOrderListSelect = {
  ...labOrderBaseSelect,
  items: {
    select: {
      ...labOrderItemBaseSelect,
      performable: {
        select: { id: true, type: true, displayName: true },
      },
    },
  },
  patient: { select: patientBaseSelect },
  createdAt: true,
  orderedAt: true,
  updatedAt: true,
  receivedAt: true,
  sourceSystem: true,
} satisfies Prisma.LabOrderSelect;

export const labOrderDetailSelect = {
  ...labOrderBaseSelect,
  items: {
    select: {
      ...labOrderItemBaseSelect,
      specimens: {
        select: {
          endedAt: true,
          endReason: true,
          assignedAt: true,
          specimen: {
            select: {
              ...specimenBaseSelect,
              specimenType: { select: { id: true, displayName: true } },
            },
          },
        },
      },
      performable: {
        select: {
          id: true,
          type: true,
          displayName: true,
          specimenTypes: {
            where: { specimenType: { isActive: true } },
            select: {
              isDefault: true,
              specimenType: {
                select: { id: true, code: true, displayName: true },
              },
            },
          },
        },
      },
    },
  },
  patient: { select: { ...patientBaseSelect, lastSyncedAt: true } },
  createdAt: true,
  orderedAt: true,
  specimens: {
    select: {
      ...specimenBaseSelect,
      orderItems: {
        select: {
          endedAt: true,
          endReason: true,
          assignedAt: true,
          labOrderItem: {
            select: {
              performable: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
            },
          },
        },
      },
      receivedAt: true,
      receivedBy: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      collectedAt: true,
      collectedBy: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      specimenType: {
        select: {
          id: true,
          code: true,
          displayName: true,
        },
      },
    },
  },
  updatedAt: true,
  receivedAt: true,
  sourceSystem: true,
  inboundEvents: { select: inboundIntegrationEventListSelect },
} satisfies Prisma.LabOrderSelect;
