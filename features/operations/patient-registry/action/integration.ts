"use server";

import z from "zod";

import { auth } from "@/auth";
import { authorize } from "@/features/authentication/lib/authorize";
import { PERMISSIONS } from "@/features/authentication/lib/permissions";
import { getPatientsFromHIS } from "../dal/integration";
import { GetPatientFromHISActionSchema } from "../schema";

export async function getPatientsFromHISAction(
  payload?: z.input<typeof GetPatientFromHISActionSchema>,
) {
  // Authentication
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthenticated.");
  }

  // Payload validation
  const parsedData = GetPatientFromHISActionSchema.safeParse(payload);
  if (!parsedData.success) {
    throw new Error("Data is invalid.");
  }

  // Authorization
  if (!authorize(session.user, PERMISSIONS.PATIENT_READ)) {
    throw new Error("Unauthorized.");
  }

  // DAL
  const queryResponse = await getPatientsFromHIS(parsedData.data);

  // Response
  return {
    data: queryResponse,
    success: true,
    message: "Data were fetched successfully.",
  };
}
