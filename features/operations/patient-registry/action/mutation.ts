"use server";

import z from "zod";

import { auth } from "@/auth";
import { authorize } from "@/features/authentication/lib/authorize";
import { PERMISSIONS } from "@/features/authentication/lib/permissions";
import { getLocalPatient } from "../dal/query";
import { getPatientsFromHIS } from "../dal/integration";
import {
  DeleteLocalPatientActionSchema,
  SyncLocalPatientHISActionSchema,
  CreateLocalPatientHISActionSchema,
  CreateLocalPatientManualActionSchema,
  UpdateLocalPatientManualActionSchema,
} from "../schema";
import {
  createLocalPatient,
  deleteLocalPatient,
  updateLocalPatient,
} from "../dal/mutation";

export async function createLocalPatientManualAction(
  payload: z.input<typeof CreateLocalPatientManualActionSchema>,
) {
  // Authentication
  const session = await auth();
  if (!session || !session.user || !session.user.laboratoryId) {
    throw new Error("Unauthenticated.");
  }

  // Payload validation
  const parsedData = CreateLocalPatientManualActionSchema.safeParse(payload);
  if (!parsedData.success) {
    throw new Error("Data is invalid.");
  }

  // Authorization
  if (!authorize(session.user, PERMISSIONS.PATIENT_CREATE)) {
    throw new Error("Unauthorized.");
  }

  // DAL
  const queryResponse = await createLocalPatient({
    name: parsedData.data.name,
    gender: parsedData.data.gender,
    source: "MANUAL",
    dateOfBirth: parsedData.data.dateOfBirth,
    laboratoryId: session.user.laboratoryId,
  });

  // Response
  return {
    data: queryResponse,
    success: true,
    message: "Patient has been created successfully.",
  };
}

export async function createLocalPatientHISAction(
  payload: z.input<typeof CreateLocalPatientHISActionSchema>,
) {
  // Authentication
  const session = await auth();
  if (!session || !session.user || !session.user.laboratoryId) {
    throw new Error("Unauthenticated.");
  }

  // Payload validation
  const parsedData = CreateLocalPatientHISActionSchema.safeParse(payload);
  if (!parsedData.success) {
    throw new Error("Data is invalid.");
  }

  // Authorization
  if (!authorize(session.user, PERMISSIONS.PATIENT_CREATE)) {
    throw new Error("Unauthorized.");
  }

  // DAL
  const patientFromHIS = (
    await getPatientsFromHIS({
      count: 1,
      patientId: parsedData.data.externalSystemId,
    })
  ).patients.at(0);

  // Patient not found
  if (!patientFromHIS) {
    throw new Error("Patient not found.");
  }

  // DAL
  const queryResponse = await createLocalPatient({
    name: patientFromHIS.name as string,
    gender: patientFromHIS.gender as "M" | "F",
    source: "HIS",
    linkedAt: new Date(),
    dateOfBirth: new Date(patientFromHIS.date_of_birth as string),
    laboratoryId: session.user.laboratoryId,
    externalSystemId: patientFromHIS.id as string,
  });

  // Response
  return {
    data: queryResponse,
    success: true,
    message: "Patient has been created successfully.",
  };
}

export async function updateLocalPatientManualAction(
  payload: z.input<typeof UpdateLocalPatientManualActionSchema>,
) {
  // Authentication
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthenticated.");
  }

  // Payload validation
  const parsedData = UpdateLocalPatientManualActionSchema.safeParse(payload);
  if (!parsedData.success) {
    throw new Error("Data is invalid.");
  }

  // Authorization
  const localPatient = await getLocalPatient({ id: payload.id });
  if (
    !localPatient ||
    localPatient.source !== "MANUAL" ||
    !authorize(session.user, PERMISSIONS.PATIENT_UPDATE)
  ) {
    throw new Error("Unauthorized.");
  }

  // DAL
  const queryResponse = await updateLocalPatient({ ...parsedData.data });

  // Response
  return {
    data: queryResponse,
    success: true,
    message: "Patient has been updated successfully.",
  };
}

export async function syncLocalPatientHISAction(
  payload: z.input<typeof SyncLocalPatientHISActionSchema>,
) {
  // Authentication
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthenticated.");
  }

  // Payload validation
  const parsedData = SyncLocalPatientHISActionSchema.safeParse(payload);
  if (!parsedData.success) {
    throw new Error("Data is invalid.");
  }

  // Authorization
  const localPatient = await getLocalPatient({ id: payload.id });
  if (
    !localPatient ||
    localPatient.source !== "HIS" ||
    !localPatient.externalSystemId ||
    !authorize(session.user, PERMISSIONS.PATIENT_UPDATE)
  ) {
    throw new Error("Unauthorized.");
  }

  // DAL
  const patientFromHIS = (
    await getPatientsFromHIS({
      count: 1,
      patientId: localPatient.externalSystemId,
    })
  ).patients.at(0);

  // Patient not found
  if (!patientFromHIS) {
    throw new Error("Patient not found.");
  }

  // DAL
  const queryResponse = await updateLocalPatient({
    id: parsedData.data.id,
    name: patientFromHIS.name as string,
    gender: patientFromHIS.gender as "M" | "F",
    dateOfBirth: new Date(patientFromHIS.date_of_birth as string),
  });

  // Response
  return {
    data: queryResponse,
    success: true,
    message: "Patient has been updated successfully.",
  };
}

export async function deleteLocalPatientAction(
  payload: z.input<typeof DeleteLocalPatientActionSchema>,
) {
  // Authentication
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthenticated.");
  }

  // Payload validation
  const parsedData = DeleteLocalPatientActionSchema.safeParse(payload);
  if (!parsedData.success) {
    throw new Error("Data is invalid.");
  }

  // Authorization
  const localPatient = await getLocalPatient({ id: payload.id });
  if (!localPatient || !authorize(session.user, PERMISSIONS.PATIENT_DELETE)) {
    throw new Error("Unauthorized.");
  }

  // DAL
  const queryResponse = await deleteLocalPatient({
    id: parsedData.data.id,
  });

  // Response
  return {
    data: queryResponse,
    success: true,
    message: "Patient has been deleted successfully.",
  };
}
