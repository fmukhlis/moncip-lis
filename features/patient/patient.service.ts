"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { UpsertPatientSchema } from "./patient.schema";
import { patientDetailSelect } from "./patient.select";

type DatabaseClient = typeof prisma;

export async function upsertPatient(
  db: Pick<DatabaseClient, "patient">,
  {
    laboratoryId,
    lastSnapshot,
    sourceSystem,
    externalPatientId,
  }: z.infer<typeof UpsertPatientSchema>,
) {
  return db.patient.upsert({
    where: {
      laboratoryId_sourceSystem_externalPatientId: {
        laboratoryId,
        sourceSystem,
        externalPatientId,
      },
    },
    create: {
      sex: lastSnapshot.sex,
      mrn: lastSnapshot.mrn,
      name: lastSnapshot.name,
      phone: lastSnapshot.phone,
      address: lastSnapshot.address,
      linkedAt: new Date(),
      laboratory: {
        connect: {
          id: laboratoryId,
        },
      },
      dateOfBirth: lastSnapshot.dateOfBirth,
      lastSyncedAt: new Date(),
      sourceSystem,
      externalPatientId,
    },
    update: {
      sex: lastSnapshot.sex,
      mrn: lastSnapshot.mrn,
      name: lastSnapshot.name,
      phone: lastSnapshot.phone,
      address: lastSnapshot.address,
      dateOfBirth: lastSnapshot.dateOfBirth,
      lastSyncedAt: new Date(),
    },
    select: patientDetailSelect,
  });
}
