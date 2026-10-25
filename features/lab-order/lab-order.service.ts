"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { buildLabOrderNo, buildLabOrderPeriod } from "@/lib/generate-item-no";
import { labOrderDetailSelect, labOrderListSelect } from "./lab-order.select";
import {
  isPaginated,
  buildPrismaPage,
  resolvePagination,
  buildPaginationMeta,
} from "@/lib/pagination";
import {
  GetLabOrderSchema,
  GetLabOrdersSchema,
  CreateLabOrderSchema,
  UpdateLabOrderSchema,
  ReserveLabOrderNoSchema,
} from "./lab-order.schema";

type DatabaseClient = typeof prisma;

export async function reserveLabOrderNo(
  db: Pick<DatabaseClient, "labOrderCounter">,
  { date }: z.infer<typeof ReserveLabOrderNoSchema>,
) {
  const period = buildLabOrderPeriod(date);

  const counter = await db.labOrderCounter.upsert({
    where: { period },
    create: { period, sequence: 1 },
    update: { sequence: { increment: 1 } },
    select: { sequence: true },
  });

  const no = buildLabOrderNo(period, counter.sequence);

  return {
    no,
    period: period,
    sequence: counter.sequence,
  };
}

export async function createLabOrder(
  db: Pick<DatabaseClient, "labOrder">,
  {
    no,
    items,
    period,
    priority,
    sequence,
    orderedAt,
    patientId,
    externalId,
    externalNo,
    laboratoryId,
    sourceSystem,
    externalPatientId,
    externalEncounterId,
    externalOrderingProviderId,
  }: z.infer<typeof CreateLabOrderSchema>,
) {
  return db.labOrder.create({
    data: {
      no,
      items: {
        create: items.map(
          ({
            note,
            priority,
            sortOrder,
            performableId,
            externalOrderItemId,
            externalLabOrderableId,
          }) => ({
            note,
            priority,
            sortOrder,
            laboratory: { connect: { id: laboratoryId } },
            performable: { connect: { id: performableId } },
            externalOrderable: { connect: { id: externalLabOrderableId } },
            externalOrderItemId,
          }),
        ),
      },
      period,
      patient: { connect: { id: patientId } },
      priority,
      sequence,
      orderedAt,
      laboratory: { connect: { id: laboratoryId } },
      externalId,
      externalNo,
      receivedAt: new Date(),
      sourceSystem,
      externalPatientId,
      externalEncounterId,
      externalOrderingProviderId,
    },
    select: labOrderDetailSelect,
  });
}

export async function getLabOrders(
  db: Pick<DatabaseClient, "labOrder">,
  {
    page,
    status,
    pageSize,
    priority,
    patientId,
    laboratoryId,
    externalPatientId,
  }: z.infer<typeof GetLabOrdersSchema>,
) {
  const where: Prisma.LabOrderWhereInput = {
    patientId,
    laboratoryId,
    externalPatientId,
    ...(status && priority && { status, priority }),
  };

  let resolvedPagination: ReturnType<typeof resolvePagination> | null = null;

  if (isPaginated({ page, pageSize })) {
    resolvedPagination = resolvePagination({ page, pageSize });
  }

  const labOrders = await db.labOrder.findMany({
    where,
    select: labOrderListSelect,
    orderBy: { createdAt: "desc" },
    ...(resolvedPagination
      ? buildPrismaPage(resolvedPagination.page, resolvedPagination.pageSize)
      : {}),
  });

  let paginationMeta: ReturnType<typeof buildPaginationMeta> | null = null;

  if (resolvedPagination) {
    const count = await db.labOrder.count({ where });

    paginationMeta = buildPaginationMeta(
      count,
      resolvedPagination.page,
      resolvedPagination.pageSize,
    );
  }

  return [labOrders, paginationMeta] as const;
}

export async function getLabOrder(
  db: Pick<DatabaseClient, "labOrder">,
  {
    id,
    no,
    externalId,
    externalNo,
    laboratoryId,
    sourceSystem,
  }: z.infer<typeof GetLabOrderSchema>,
) {
  return await db.labOrder.findFirst({
    where: { id, no, externalId, externalNo, laboratoryId, sourceSystem },
    select: labOrderDetailSelect,
  });
}

export async function updateLabOrder(
  db: Pick<DatabaseClient, "labOrder">,
  {
    items,
    status,
    priority,
    orderedAt,
    patientId,
    externalId,
    externalNo,
    laboratoryId,
    sourceSystem,
    externalPatientId,
    externalEncounterId,
    externalOrderingProviderId,
  }: z.infer<typeof UpdateLabOrderSchema>,
) {
  return db.labOrder.update({
    where: {
      laboratoryId_sourceSystem_externalId: {
        externalId,
        laboratoryId,
        sourceSystem,
      },
    },
    data: {
      items: {
        deleteMany: {},
        create: items.map(
          ({
            note,
            priority,
            sortOrder,
            performableId,
            externalOrderItemId,
            externalLabOrderableId,
          }) => ({
            note,
            priority,
            sortOrder,
            laboratory: { connect: { id: laboratoryId } },
            performable: { connect: { id: performableId } },
            externalOrderable: { connect: { id: externalLabOrderableId } },
            externalOrderItemId,
          }),
        ),
      },
      status,
      patient: { connect: { id: patientId } },
      priority,
      orderedAt,
      externalId,
      externalNo,
      receivedAt: new Date(),
      sourceSystem,
      externalPatientId,
      externalEncounterId,
      externalOrderingProviderId,
    },
    select: labOrderDetailSelect,
  });
}
