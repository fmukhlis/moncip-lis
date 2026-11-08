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
  SpecimenReceiptSchema,
  ReuseSpecimenSchema,
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
      sequence,
      laboratory: { connect: { id: laboratoryId } },
      // The order items are what attaches the specimen to its order.
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

/**
 * Resolves the value written to the shared `Specimen.note` column. An omitted
 * note leaves the stored one untouched, while an empty note clears it.
 */
function resolveSpecimenNote(note: string | undefined) {
  return note === undefined ? undefined : note.length ? note : null;
}

/**
 * Writes the collection record of a specimen.
 *
 * While a specimen is pending this logs a new collection; for a collected or
 * received specimen the caller passes the current status, so correcting the
 * collection record never changes the status. The receipt record and the
 * assignment history are never written here.
 */
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
      note: resolveSpecimenNote(note),
    },
    select: specimenDetailSelect,
  });
}

/**
 * The reuse payload: the specimen and laboratory identify the specimen, while
 * the order items are the ones it is attached to. The schema names the items
 * after the action payload, so the service takes them under their own name.
 */
type ReuseSpecimenParams = Pick<
  z.infer<typeof ReuseSpecimenSchema>,
  "id" | "laboratoryId"
> & { orderItemIds: string[] };

/**
 * Reuses a specimen by attaching it to more order items.
 *
 * The write is append-only: it creates the missing assignments and writes
 * nothing else, so the status, the collection and receipt records and every
 * previous assignment stay exactly as they are. That is also what keeps the
 * target order resyncable from its source system, which is blocked as soon as
 * one of its items carries a specimen.
 */
export async function reuseSpecimen(
  db: Pick<DatabaseClient, "specimen">,
  { id, laboratoryId, orderItemIds }: ReuseSpecimenParams,
) {
  return db.specimen.update({
    where: { id, laboratoryId },
    data: {
      orderItems: {
        create: orderItemIds.map((labOrderItemId) => ({
          laboratory: { connect: { id: laboratoryId } },
          labOrderItem: { connect: { id: labOrderItemId } },
        })),
      },
    },
    select: specimenDetailSelect,
  });
}

/**
 * Records the receipt of a specimen. While a specimen is collected this logs a
 * new receipt; for a received specimen the caller passes the current status, so
 * correcting the receipt record never changes the status. The receipt record
 * (the received time and the receiving personnel), the shared note and the
 * status are written, so the collection record and the assignment history are
 * left untouched.
 */
export async function receiveSpecimen(
  db: Pick<DatabaseClient, "specimen">,
  {
    id,
    note,
    status,
    receivedAt,
    receivedById,
    laboratoryId,
  }: z.infer<typeof SpecimenReceiptSchema> & { status: SpecimenStatus },
) {
  return db.specimen.update({
    where: { id, laboratoryId },
    data: {
      status,
      receivedAt,
      receivedById,
      note: resolveSpecimenNote(note),
    },
    select: specimenDetailSelect,
  });
}
