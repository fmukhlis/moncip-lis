"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  CreateLabOrderItemSpecimenSchema,
  UpdateManyLabOrderItemSpecimenSchema,
} from "./lab-order-item-specimen.schema";

type DatabaseClient = typeof prisma;

export async function createLabOrderItemSpecimen(
  db: Pick<DatabaseClient, "labOrderItemSpecimen">,
  {
    specimenId,
    laboratoryId,
    labOrderItemId,
  }: z.infer<typeof CreateLabOrderItemSpecimenSchema>,
) {
  return db.labOrderItemSpecimen.create({
    data: {
      specimen: { connect: { id: specimenId } },
      laboratory: { connect: { id: laboratoryId } },
      labOrderItem: { connect: { id: labOrderItemId } },
    },
  });
}

export async function updateManyLabOrderItemSpecimen(
  db: Pick<DatabaseClient, "labOrderItemSpecimen">,
  {
    endedAt,
    endReason,
    onlyActive,
    specimenId,
    laboratoryId,
    excludedLabOrderItemIds,
  }: z.infer<typeof UpdateManyLabOrderItemSpecimenSchema>,
) {
  return db.labOrderItemSpecimen.updateMany({
    where: {
      specimenId,
      laboratoryId,
      ...(onlyActive && { endedAt: null }),
      ...(excludedLabOrderItemIds && {
        labOrderItemId: { notIn: excludedLabOrderItemIds },
      }),
    },
    data: {
      endedAt,
      endReason,
    },
  });
}
