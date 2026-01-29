"use server";

import z from "zod";

import { auth } from "@/auth";
import { authorize } from "@/features/authentication/lib/authorize";
import { PERMISSIONS } from "@/features/authentication/lib/permissions";
import { getLocalPatient, getLocalPatients } from "../dal/query";
import {
  GetLocalPatientActionSchema,
  GetLocalPatientsActionSchema,
} from "../schema";

export async function getLocalPatientsAction(
  payload?: z.input<typeof GetLocalPatientsActionSchema>,
) {
  // Authentication
  const session = await auth();
  if (!session || !session.user || !session.user.laboratoryId) {
    throw new Error("Unauthenticated.");
  }

  // Payload validation
  const parsedData = GetLocalPatientsActionSchema.safeParse(payload);
  if (!parsedData.success) {
    throw new Error("Data is invalid.");
  }

  // Authorization
  if (!authorize(session.user, PERMISSIONS.PATIENT_READ)) {
    throw new Error("Unauthorized.");
  }

  // DAL
  const queryResponse = await getLocalPatients({
    count: parsedData.data?.count,
    laboratoryId: session.user.laboratoryId,
  });

  // Response
  return {
    data: queryResponse,
    success: true,
    message: "Data were fetched successfully.",
  };
}

export async function getLocalPatientAction(
  payload: z.input<typeof GetLocalPatientActionSchema>,
) {
  // Authentication
  const session = await auth();
  if (!session || !session.user || !session.user.laboratoryId) {
    throw new Error("Unauthenticated.");
  }

  // Payload validation
  const parsedData = GetLocalPatientActionSchema.safeParse(payload);
  if (!parsedData.success) {
    throw new Error("Data is invalid.");
  }

  // Authorization
  if (!authorize(session.user, PERMISSIONS.PATIENT_READ)) {
    throw new Error("Unauthorized.");
  }

  // DAL
  const queryResponse = await getLocalPatient({ id: parsedData.data.id });

  // Response
  return {
    data: queryResponse,
    success: true,
    message: "Data were fetched successfully.",
  };
}
