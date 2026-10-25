"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  getDepartment,
  getDepartments,
  createDepartment,
  updateDepartment,
} from "./department.service";
import {
  GetDepartmentSchema,
  GetDepartmentsSchema,
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  GetDepartmentActionSchema,
  GetDepartmentsActionSchema,
  UpdateDepartmentActionSchema,
  CreateDepartmentActionSchema,
} from "./department.schema";

export async function createDepartmentAction(
  params: z.infer<typeof CreateDepartmentActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "DEPARTMENT:CREATE")) {
    throw new UnauthorizedError(
      "You don't have permission to create a department.",
    );
  }

  const { laboratoryId } = user;

  const parsedCreateDepartmentParams = CreateDepartmentSchema.parse({
    ...params,
    laboratoryId,
  });

  const department = await createDepartment(
    prisma,
    parsedCreateDepartmentParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...department,
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    },
  };
}

export async function getDepartmentsAction(
  params: z.infer<typeof GetDepartmentsActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "DEPARTMENT:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view departments.",
    );
  }

  const { laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    const parsedGetDepartmentsParams = GetDepartmentsSchema.parse({
      ...params,
      laboratoryId,
    });

    const [departments, paginationMeta] = await getDepartments(
      tx,
      parsedGetDepartmentsParams,
    );

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: departments.map((department) => ({
        ...department,
        createdAt: department.createdAt.toISOString(),
        updatedAt: department.updatedAt.toISOString(),
      })),
      pagination: paginationMeta,
    };
  });
}

export async function getDepartmentAction(
  params: z.infer<typeof GetDepartmentActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "DEPARTMENT:READ")) {
    throw new UnauthorizedError(
      "You don't have permission to view this department.",
    );
  }

  const { laboratoryId } = user;

  const parsedGetDepartmentParams = GetDepartmentSchema.parse({
    ...params,
    laboratoryId,
  });

  const department = await getDepartment(prisma, parsedGetDepartmentParams);

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: department
      ? {
          ...department,
          createdAt: department.createdAt.toISOString(),
          updatedAt: department.updatedAt.toISOString(),
        }
      : null,
  };
}

export async function updateDepartmentAction(
  params: z.infer<typeof UpdateDepartmentActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "DEPARTMENT:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to update this department.",
    );
  }

  const { laboratoryId } = user;

  const parsedUpdateDepartmentParams = UpdateDepartmentSchema.parse({
    ...params,
    laboratoryId,
  });

  const department = await updateDepartment(
    prisma,
    parsedUpdateDepartmentParams,
  );

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...department,
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    },
  };
}
