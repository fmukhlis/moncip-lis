"use server";

import z from "zod";
import prisma from "@/lib/prisma";

import { formatISO } from "date-fns";
import {
  CreateLocalPatientSchema,
  DeleteLocalPatientSchema,
  UpdateLocalPatientSchema,
} from "../schema";

export async function createLocalPatient({
  name,
  source,
  gender,
  linkedAt,
  dateOfBirth,
  laboratoryId,
  externalSystemId,
}: z.infer<typeof CreateLocalPatientSchema>) {
  const rawData = await prisma.patient.create({
    data: {
      name,
      source,
      gender,
      linkedAt,
      laboratory: { connect: { id: laboratoryId } },
      dateOfBirth,
      externalSystemId,
    },
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

export async function updateLocalPatient({
  id,
  name,
  gender,
  source,
  linkedAt,
  dateOfBirth,
  externalSystemId,
}: z.infer<typeof UpdateLocalPatientSchema>) {
  const rawData = await prisma.patient.update({
    where: { id },
    data: { name, gender, source, linkedAt, dateOfBirth, externalSystemId },
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

export async function deleteLocalPatient({
  id,
}: z.infer<typeof DeleteLocalPatientSchema>) {
  const rawData = await prisma.patient.update({
    where: { id },
    data: { deletedAt: new Date() },
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
