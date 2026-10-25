"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  getLisResultComponent,
  getLisResultComponents,
  createLisResultComponent,
  updateLisResultComponent,
  getLisResultComponentNextSortOrder,
} from "./lis-result-component.service";
import {
  GetLisResultComponentSchema,
  GetLisResultComponentsSchema,
  CreateLisResultComponentSchema,
  UpdateLisResultComponentSchema,
  GetLisResultComponentActionSchema,
  GetLisResultComponentsActionSchema,
  CreateLisResultComponentActionSchema,
  UpdateLisResultComponentActionSchema,
  UpdateLisResultComponentsOrderSchema,
  GetLisResultComponentNextSortOrderSchema,
  UpdateLisResultComponentsOrderActionSchema,
} from "./lis-result-component.schema";

export async function createLisResultComponentAction(
  params: z.infer<typeof CreateLisResultComponentActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LIS_RESULT_COMPONENT:CREATE")) {
    throw new UnauthorizedError(
      "You don't have permission to create a lis result component.",
    );
  }

  const { laboratoryId } = user;

  return await prisma.$transaction(async (tx) => {
    // The sortOrder is not provided by the client and is calculated
    // automatically here.
    const parsedGetLisResultComponentNextSortOrderParams =
      GetLisResultComponentNextSortOrderSchema.parse({
        laboratoryId,
        performableId: params.performableId,
      });

    const sortOrder = await getLisResultComponentNextSortOrder(
      tx,
      parsedGetLisResultComponentNextSortOrderParams,
    );

    const parsedCreateLisResultComponentParams =
      CreateLisResultComponentSchema.parse({
        ...params,
        sortOrder,
        laboratoryId,
      });

    const lisResultComponent = await createLisResultComponent(
      prisma,
      parsedCreateLisResultComponentParams,
    );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: {
        ...lisResultComponent,
        createdAt: lisResultComponent.createdAt.toISOString(),
        updatedAt: lisResultComponent.updatedAt.toISOString(),
      },
    };
  });
}

export async function getLisResultComponentsAction(
  params: z.infer<typeof GetLisResultComponentsActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LIS_RESULT_COMPONENT:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view lis result components.",
    );
  }

  const { laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    const parsedGetLisResultComponentsParams =
      GetLisResultComponentsSchema.parse({
        ...params,
        laboratoryId,
      });

    const [lisResultComponents, paginationMeta] = await getLisResultComponents(
      tx,
      parsedGetLisResultComponentsParams,
    );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: lisResultComponents.map((lisResultComponent) => ({
        ...lisResultComponent,
      })),
      paginationMeta,
    };
  });
}

export async function getLisResultComponentAction(
  params: z.infer<typeof GetLisResultComponentActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LIS_RESULT_COMPONENT:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this lis result component.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetLisResultComponentParams = GetLisResultComponentSchema.parse({
    ...params,
    laboratoryId,
  });

  const lisResultComponent = await getLisResultComponent(
    prisma,
    parsedGetLisResultComponentParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: lisResultComponent
      ? {
          ...lisResultComponent,
          createdAt: lisResultComponent.createdAt.toISOString(),
          updatedAt: lisResultComponent.updatedAt.toISOString(),
        }
      : null,
  };
}

export async function updateLisResultComponentAction(
  params: z.infer<typeof UpdateLisResultComponentActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LIS_RESULT_COMPONENT:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to update this lis result component.",
    );
  }

  const { laboratoryId } = user;

  const parsedUpdateLisResultComponentParams =
    UpdateLisResultComponentSchema.parse({
      ...params,
      laboratoryId,
    });

  const lisResultComponent = await updateLisResultComponent(
    prisma,
    parsedUpdateLisResultComponentParams,
  );

  return {
    data: {
      ...lisResultComponent,
      createdAt: lisResultComponent.createdAt.toISOString(),
      updatedAt: lisResultComponent.updatedAt.toISOString(),
    },
  };
}

// Mainly useful for reordering lis result components. Maybe we should rename it>
export async function updateLisResultComponentsOrderAction(
  params: z.infer<typeof UpdateLisResultComponentsOrderActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "LIS_RESULT_COMPONENT:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to update this lis result component.",
    );
  }

  const { laboratoryId } = user;

  return await prisma.$transaction(async (tx) => {
    const parsedUpdateLisResultComponentsOrderParams =
      UpdateLisResultComponentsOrderSchema.parse({
        ...params,
        laboratoryId,
      });

    // Update every record in parallel.
    const unsortedLisResultComponents = await Promise.all(
      parsedUpdateLisResultComponentsOrderParams.lisResultComponents.map(
        ({ id, sortOrder }) =>
          updateLisResultComponent(tx, {
            id,
            sortOrder,
            laboratoryId:
              parsedUpdateLisResultComponentsOrderParams.laboratoryId,
          }),
      ),
    );

    const sortedLisResultComponents = unsortedLisResultComponents.sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    return {
      data: sortedLisResultComponents.map((lisResultComponent) => ({
        ...lisResultComponent,
        createdAt: lisResultComponent.createdAt.toISOString(),
        updatedAt: lisResultComponent.updatedAt.toISOString(),
      })),
    };
  });
}
