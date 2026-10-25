"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import {
  GetLabOrderItemsSchema,
  ResolveLabOrderItemSchema,
} from "./lab-order-item.schema";
import {
  OrderableNotRegisteredError,
  PerformableNotConfiguredError,
  AmbiguousPerformableMappingError,
} from "../external-lab-orderable/external-lab-orderable.error";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";

type DatabaseClient = typeof prisma;

export async function resolveLabOrderItem(
  db: Pick<DatabaseClient, "externalLabOrderable">,
  { connectionId, labOrderItems }: z.infer<typeof ResolveLabOrderItemSchema>,
) {
  const orderables = await db.externalLabOrderable.findMany({
    where: {
      isActive: true,
      connectionId,
      externalOrderableId: {
        in: labOrderItems.map(
          (labOrderItem) => labOrderItem.externalOrderableId,
        ),
      },
    },
    include: {
      performables: {
        take: 1,
        where: { isActive: true },
      },
    },
  });

  const orderablesMap = new Map(
    orderables.map((orderable) => [orderable.externalOrderableId, orderable]),
  );

  return labOrderItems.map((labOrderItem) => {
    const orderable = orderablesMap.get(labOrderItem.externalOrderableId);

    if (!orderable) {
      throw new OrderableNotRegisteredError(labOrderItem.externalOrderableId);
    }

    if (orderable.performables.length === 0) {
      throw new PerformableNotConfiguredError(labOrderItem.externalOrderableId);
    }

    if (orderable.performables.length > 1) {
      throw new AmbiguousPerformableMappingError(
        labOrderItem.externalOrderableId,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { externalOrderableId, ...rest } = labOrderItem;

    return {
      ...rest,
      performableId: orderable.performables[0].id,
      externalLabOrderableId: orderable.id,
    };
  });
}

export async function getLabOrderItems(
  db: Pick<DatabaseClient, "labOrderItem">,
  {
    page,
    search,
    status,
    pageSize,
    priority,
    laboratoryId,
  }: z.infer<typeof GetLabOrderItemsSchema>,
) {
  const where: Prisma.LabOrderItemWhereInput = {
    laboratoryId,
    ...(search && {
      OR: [
        {
          externalOrderable: {
            OR: [
              { externalCode: { contains: search, mode: "insensitive" } },
              { externalDisplay: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    }),
    ...(status && { status: { in: status } }),
    ...(priority && { priority: { in: priority } }),
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const labOrderItems = await db.labOrderItem.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.labOrderItem.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [labOrderItems, paginationMeta] as const;
}
