"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { getUnit, getUnits } from "./unit.service";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  GetUnitSchema,
  GetUnitsSchema,
  GetUnitActionSchema,
  GetUnitsActionSchema,
} from "./unit.schema";

export async function getUnitsAction(
  params: z.infer<typeof GetUnitsActionSchema>,
) {
  await ensureUserAuthenticated();

  const parsedGetUnitsParams = GetUnitsSchema.parse(params);

  const [units, paginationMeta] = await getUnits(prisma, parsedGetUnitsParams);

  return {
    data: units.map(({ createdAt, updatedAt, ...rest }) => ({
      ...rest,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })),
    paginationMeta,
  };
}

export async function getUnitAction(
  params: z.infer<typeof GetUnitActionSchema>,
) {
  await ensureUserAuthenticated();

  const parsedGetUnitParams = GetUnitSchema.parse(params);

  const unit = await getUnit(prisma, parsedGetUnitParams);

  return {
    data: unit
      ? {
          ...unit,
          createdAt: unit.createdAt.toISOString(),
          updatedAt: unit.updatedAt.toISOString(),
        }
      : null,
  };
}
