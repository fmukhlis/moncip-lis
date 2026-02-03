"use server";

import z from "zod";
import prisma from "@/lib/prisma";

import { formatISO } from "date-fns";
import { GetLocalPatientSchema, GetLocalPatientsSchema } from "../schema";

export async function getLocalPatients({
  count,
  laboratoryId,
}: z.infer<typeof GetLocalPatientsSchema>) {
  const rawData = await prisma.laboratory.findUnique({
    where: { id: laboratoryId },
    select: {
      patients: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          gender: true,
          source: true,
          dateOfBirth: true,
          externalSystemId: true,
        },
        take: count,
        orderBy: { name: "asc" },
      },
    },
  });

  return rawData
    ? rawData.patients.map((patient) => ({
        ...patient,
        dateOfBirth: formatISO(patient.dateOfBirth),
      }))
    : [];
}

export async function getLocalPatient({
  id,
}: z.infer<typeof GetLocalPatientSchema>) {
  const rawData = await prisma.patient.findUnique({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      gender: true,
      source: true,
      linkedAt: true,
      createdAt: true,
      dateOfBirth: true,
      externalSystemId: true,
    },
  });

  return rawData
    ? {
        ...rawData,
        linkedAt: rawData.linkedAt ? formatISO(rawData.linkedAt) : null,
        createdAt: rawData.createdAt ? formatISO(rawData.createdAt) : null,
        dateOfBirth: formatISO(rawData.dateOfBirth),
      }
    : null;
}
