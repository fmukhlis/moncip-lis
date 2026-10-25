"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "../authentication/authentication.policy";
import { UnauthorizedError } from "../authentication/authentication.error";
import { ensureUserAuthenticated } from "@/lib/ensure-user-authenticated";
import {
  getUser,
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} from "./user.service";
import {
  GetUserSchema,
  GetUsersSchema,
  CreateUserSchema,
  DeleteUserSchema,
  UpdateUserSchema,
  GetUserActionSchema,
  GetUsersActionSchema,
  CreateUserActionSchema,
  DeleteUserActionSchema,
  UpdateUserActionSchema,
} from "./user.schema";

export async function createUserAction(
  params: z.infer<typeof CreateUserActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "USER:CREATE")) {
    throw new UnauthorizedError("You don't have permission to create a user.");
  }

  const { laboratoryId } = user;

  const parsedCreateUserParams = CreateUserSchema.parse({
    ...params,
    laboratoryId,
  });

  const createdUser = await createUser(prisma, parsedCreateUserParams);

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...createdUser,
      createdAt: createdUser.createdAt.toISOString(),
      updatedAt: createdUser.updatedAt.toISOString(),
    },
  };
}

export async function getUsersAction(
  params: z.infer<typeof GetUsersActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "USER:READ")) {
    throw new UnauthorizedError("You don't have permission to view users.");
  }

  const { laboratoryId } = user;

  return prisma.$transaction(async (tx) => {
    const parsedGetUsersParams = GetUsersSchema.parse({
      ...params,
      laboratoryId,
    });

    const [users, paginationMeta] = await getUsers(tx, parsedGetUsersParams);

    // Serialize dates here so the client doesn't have to do it manually.
    return {
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      paginationMeta,
    };
  });
}

export async function getUserAction(
  params: z.infer<typeof GetUserActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "USER:READ")) {
    throw new UnauthorizedError("You don't have permission to view this user.");
  }

  const { laboratoryId } = user;

  const parsedGetUserParams = GetUserSchema.parse({
    ...params,
    laboratoryId,
  });

  const retrievedUser = await getUser(prisma, parsedGetUserParams);

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: retrievedUser
      ? {
          ...retrievedUser,
          createdAt: retrievedUser.createdAt.toISOString(),
          updatedAt: retrievedUser.updatedAt.toISOString(),
        }
      : null,
  };
}

export async function updateUserAction(
  params: z.infer<typeof UpdateUserActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "USER:UPDATE")) {
    throw new UnauthorizedError(
      "You don't have permission to update this user.",
    );
  }

  const { laboratoryId } = user;

  const parsedUpdateUserParams = UpdateUserSchema.parse({
    ...params,
    laboratoryId,
  });

  const updatedUser = await updateUser(prisma, parsedUpdateUserParams);

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    },
  };
}

export async function deleteUserAction(
  params: z.infer<typeof DeleteUserActionSchema>,
) {
  const user = await ensureUserAuthenticated();

  if (!authorize(user, "USER:DELETE")) {
    throw new UnauthorizedError(
      "You don't have permission to delete this user.",
    );
  }

  const { laboratoryId } = user;

  const parsedDeleteUserParams = DeleteUserSchema.parse({
    ...params,
    laboratoryId,
  });

  const deletedUser = await deleteUser(prisma, parsedDeleteUserParams);

  // Serialize dates here so the client doesn't have to do it manually.
  return {
    data: {
      ...deletedUser,
      createdAt: deletedUser.createdAt.toISOString(),
      updatedAt: deletedUser.updatedAt.toISOString(),
    },
  };
}
