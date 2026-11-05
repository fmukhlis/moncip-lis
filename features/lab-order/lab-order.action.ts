"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  getLabOrder,
  getLabOrders,
  getLabOrderSpecimens,
} from "./lab-order.service";
import {
  GetLabOrderSchema,
  GetLabOrdersSchema,
  GetLabOrderActionSchema,
  GetLabOrdersActionSchema,
  GetLabOrderSpecimensSchema,
} from "./lab-order.schema";

export async function getLabOrdersAction(
  params: z.infer<typeof GetLabOrdersActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LAB_ORDER:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view laboratory orders.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetLabOrdersParams = GetLabOrdersSchema.parse({
    ...params,
    laboratoryId,
  });

  const [labOrders, paginationMeta] = await getLabOrders(
    prisma,
    parsedGetLabOrdersParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: labOrders.map(
      ({
        items,
        patient,
        createdAt,
        orderedAt,
        updatedAt,
        receivedAt,
        ...rest
      }) => ({
        ...rest,
        patient: {
          ...patient,
          dateOfBirth: patient?.dateOfBirth.toISOString(),
        },
        createdAt: createdAt.toISOString(),
        orderedAt: orderedAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        receivedAt: receivedAt.toISOString(),
        items: items.map(({ specimens, ...item }) => ({
          ...item,
          specimens: specimens.map(({ endedAt, specimen }) => ({
            endedAt: endedAt?.toISOString() ?? null,
            specimen,
          })),
        })),
      }),
    ),
    paginationMeta,
  };
}

export async function getLabOrderAction(
  params: z.infer<typeof GetLabOrderActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LAB_ORDER:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this laboratory order.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetLabOrderParams = GetLabOrderSchema.parse({
    ...params,
    laboratoryId,
  });

  const labOrder = await getLabOrder(prisma, parsedGetLabOrderParams);

  if (!labOrder) {
    return { data: null };
  }

  // An order reaches its specimens through its items, so they are loaded with the
  // order they belong to and serialized together with it.
  const specimens = await getLabOrderSpecimens(
    prisma,
    GetLabOrderSpecimensSchema.parse({ id: labOrder.id, laboratoryId }),
  );

  return {
    data: {
      ...labOrder,
      patient: {
        ...labOrder.patient,
        dateOfBirth: labOrder.patient?.dateOfBirth.toISOString(),
        lastSyncedAt: labOrder.patient?.lastSyncedAt?.toISOString(),
      },
      items: labOrder.items.map(({ specimens, ...rest }) => ({
        ...rest,
        specimens: specimens.map(({ endedAt, assignedAt, ...rest }) => ({
          ...rest,
          endedAt: endedAt?.toISOString(),
          assignedAt: assignedAt?.toISOString(),
        })),
      })),
      createdAt: labOrder.createdAt.toISOString(),
      orderedAt: labOrder.orderedAt.toISOString(),
      specimens: specimens.map(
        ({ collectedAt, receivedAt, orderItems, ...rest }) => ({
          ...rest,
          orderItems: orderItems.map(({ endedAt, assignedAt, ...rest }) => ({
            ...rest,
            endedAt: endedAt?.toISOString(),
            assignedAt: assignedAt?.toISOString(),
          })),
          receivedAt: receivedAt?.toISOString(),
          collectedAt: collectedAt?.toISOString(),
        }),
      ),
      updatedAt: labOrder.updatedAt.toISOString(),
      receivedAt: labOrder.receivedAt.toISOString(),
      inboundEvents: labOrder.inboundEvents.map(
        ({ createdAt, updatedAt, receivedAt, processedAt, ...rest }) => ({
          ...rest,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
          receivedAt: receivedAt.toISOString(),
          processedAt: processedAt?.toISOString(),
        }),
      ),
    },
  };
}
