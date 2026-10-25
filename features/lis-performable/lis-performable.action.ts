"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  getLisPerformable,
  getLisPerformables,
  createLisPerformable,
  updateLisPerformable,
} from "./lis-performable.service";
import {
  GetLisPerformableSchema,
  GetLisPerformablesSchema,
  CreateLisPerformableSchema,
  UpdateLisPerformableSchema,
  GetLisPerformableActionSchema,
  GetLisPerformablesActionSchema,
  CreateLisPerformableActionSchema,
  UpdateLisPerformableActionSchema,
} from "./lis-performable.schema";

export async function createLisPerformableAction(
  params: z.infer<typeof CreateLisPerformableActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LIS_PERFORMABLE:CREATE")) {
    throw new UnauthorizedError(
      "You don't have permission to create a lis performable.",
    );
  }

  const { laboratoryId } = user;

  const parsedCreateLisPerformableParams = CreateLisPerformableSchema.parse({
    ...params,
    laboratoryId,
  });

  const lisPerformable = await createLisPerformable(
    prisma,
    parsedCreateLisPerformableParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...lisPerformable,
      createdAt: lisPerformable.createdAt.toISOString(),
      updatedAt: lisPerformable.updatedAt.toISOString(),
    },
  };
}

export async function getLisPerformablesAction(
  params: z.infer<typeof GetLisPerformablesActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LIS_PERFORMABLE:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view lis performables.",
    );
  }

  const { laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    const parsedGetLisPerformablesParams = GetLisPerformablesSchema.parse({
      ...params,
      laboratoryId,
    });

    const [lisPerformables, paginationMeta] = await getLisPerformables(
      tx,
      parsedGetLisPerformablesParams,
    );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: lisPerformables.map((lisPerformable) => ({
        ...lisPerformable,
        createdAt: lisPerformable.createdAt.toISOString(),
        updatedAt: lisPerformable.updatedAt.toISOString(),
      })),
      paginationMeta,
    };
  });
}

export async function getLisPerformableAction(
  params: z.infer<typeof GetLisPerformableActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LIS_PERFORMABLE:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this lis performable.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetLisPerformableParams = GetLisPerformableSchema.parse({
    ...params,
    laboratoryId,
  });

  const lisPerformable = await getLisPerformable(
    prisma,
    parsedGetLisPerformableParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: lisPerformable
      ? {
          ...lisPerformable,
          createdAt: lisPerformable.createdAt.toISOString(),
          updatedAt: lisPerformable.updatedAt.toISOString(),
        }
      : null,
  };
}

export async function updateLisPerformableAction(
  params: z.infer<typeof UpdateLisPerformableActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LIS_PERFORMABLE:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to update this lis performable.",
    );
  }

  const { laboratoryId } = user;

  const parsedUpdateLisPerformableParams = UpdateLisPerformableSchema.parse({
    ...params,
    laboratoryId,
  });

  const lisPerformable = await updateLisPerformable(
    prisma,
    parsedUpdateLisPerformableParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...lisPerformable,
      createdAt: lisPerformable.createdAt.toISOString(),
      updatedAt: lisPerformable.updatedAt.toISOString(),
    },
  };
}
