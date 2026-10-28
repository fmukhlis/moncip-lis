"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { SpecimenStatus } from "@/generated/prisma";
import { specimenDetailSelect } from "./specimen.select";
import { buildSpecimenNo, buildSpecimenPeriod } from "@/lib/generate-item-no";
import {
  CreateSpecimenSchema,
  UpdateSpecimenSchema,
  ReserveSpecimenNoSchema,
  GetSpecimenSchema,
  CollectSpecimenSchema,
} from "./specimen.schema";

type DatabaseClient = typeof prisma;

export async function reserveSpecimenNo(
  db: Pick<DatabaseClient, "specimenCounter">,
  { date }: z.infer<typeof ReserveSpecimenNoSchema>,
) {
  const period = buildSpecimenPeriod(date);

  const counter = await db.specimenCounter.upsert({
    where: { period },
    create: { period, sequence: 1 },
    update: { sequence: { increment: 1 } },
    select: { sequence: true },
  });

  const no = buildSpecimenNo(period, counter.sequence);

  return {
    no,
    period: period,
    sequence: counter.sequence,
  };
}

export async function createSpecimen(
  db: Pick<DatabaseClient, "specimen">,
  {
    no,
    period,
    sequence,
    patientId,
    labOrderId,
    orderItemIds,
    laboratoryId,
    specimenTypeId,
  }: z.infer<typeof CreateSpecimenSchema>,
) {
  return db.specimen.create({
    data: {
      no,
      period,
      status: "PENDING",
      patient: { connect: { id: patientId } },
      labOrder: { connect: { id: labOrderId } },
      sequence,
      laboratory: { connect: { id: laboratoryId } },
      orderItems: {
        create: orderItemIds.map((id) => ({
          laboratory: { connect: { id: laboratoryId } },
          labOrderItem: { connect: { id } },
        })),
      },
      specimenType: { connect: { id: specimenTypeId } },
    },
    select: specimenDetailSelect,
  });
}

export async function getSpecimen(
  db: Pick<DatabaseClient, "specimen">,
  { id, laboratoryId }: z.infer<typeof GetSpecimenSchema>,
) {
  return db.specimen.findFirst({
    where: { id, laboratoryId },
    select: specimenDetailSelect,
  });
}

export async function updateSpecimen(
  db: Pick<DatabaseClient, "specimen">,
  {
    id,
    note,
    status,
    receivedAt,
    rejectedAt,
    collectedAt,
    cancelledAt,
    orderItemIds,
    laboratoryId,
    specimenTypeId,
    rejectionReason,
    cancellationReason,
  }: z.infer<typeof UpdateSpecimenSchema>,
) {
  return db.specimen.update({
    where: { id, laboratoryId },
    data: {
      note,
      status,
      receivedAt,
      rejectedAt,
      collectedAt,
      cancelledAt,
      orderItems: orderItemIds
        ? {
            create: orderItemIds.map((id) => ({
              laboratory: { connect: { id: laboratoryId } },
              labOrderItem: { connect: { id } },
            })),
          }
        : undefined,
      specimenType: specimenTypeId
        ? { connect: { id: specimenTypeId } }
        : undefined,
      rejectionReason,
      cancellationReason,
    },
    select: specimenDetailSelect,
  });
}

export async function collectSpecimen(
  db: Pick<DatabaseClient, "specimen">,
  {
    id,
    note,
    status,
    collectedAt,
    collectedById,
    laboratoryId,
  }: z.infer<typeof CollectSpecimenSchema> & { status: SpecimenStatus },
) {
  return db.specimen.update({
    where: { id, laboratoryId },
    data: {
      status,
      collectedAt,
      collectedById,
      note: note === undefined ? undefined : note.length ? note : null,
    },
    select: specimenDetailSelect,
  });
}
