"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import { getSpecimenType, getSpecimenTypes } from "./specimen-type.service";
import {
  GetSpecimenTypeSchema,
  GetSpecimenTypesSchema,
  GetSpecimenTypeActionSchema,
  GetSpecimenTypesActionSchema,
} from "./specimen-type.schema";

export async function getSpecimenTypesAction(
  params: z.infer<typeof GetSpecimenTypesActionSchema>,
) {
  await ensureUserAuthenticated();

  return prisma.$transaction(async (tx) => {
    const parsedGetSpecimenTypesParams = GetSpecimenTypesSchema.parse({
      ...params,
    });

    const [specimenTypes, paginationMeta] = await getSpecimenTypes(
      tx,
      parsedGetSpecimenTypesParams,
    );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: specimenTypes.map((specimenType) => ({ ...specimenType })),
      paginationMeta,
    };
  });
}

export async function getSpecimenTypeAction(
  params: z.infer<typeof GetSpecimenTypeActionSchema>,
) {
  await ensureUserAuthenticated();

  const parsedGetSpecimenTypeParams = GetSpecimenTypeSchema.parse({
    ...params,
  });

  const specimenType = await getSpecimenType(
    prisma,
    parsedGetSpecimenTypeParams,
  );

  return {
    data: specimenType
      ? {
          ...specimenType,
          createdAt: specimenType.createdAt.toISOString(),
          updatedAt: specimenType.updatedAt.toISOString(),
        }
      : null,
  };
}
