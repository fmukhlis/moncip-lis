import z from "zod";
import prisma from "@/lib/prisma";
import saltAndHash from "@/lib/salt-and-hash";

import { Prisma } from "@/generated/prisma";
import { CreateUserSchema, UpdateUserSchema } from "../schema";

export async function getUserCredentials(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  return user?.username && user.password
    ? {
        id: user.id,
        username: user.username,
        password: user.password,
      }
    : null;
}

export async function getUserPublic(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });

  return user
    ? {
        name: user.name,
        role: user.role,
        image: user.image,
        laboratoryId: user.laboratoryId,
      }
    : null;
}

export async function createUser(
  laboratoryId: string,
  { name, role, username, password }: z.infer<typeof CreateUserSchema>,
) {
  return await prisma.user.create({
    data: {
      name,
      role,
      username,
      password: await saltAndHash(password),
      laboratory: {
        connect: {
          id: laboratoryId,
        },
      },
    },
  });
}

export async function updateUser(
  tx: Prisma.TransactionClient,
  userId: string,
  { name, role, username, password }: z.infer<typeof UpdateUserSchema>,
) {
  return await tx.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      role,
      username,
      password: password ? await saltAndHash(password) : undefined,
    },
  });
}

export async function deleteUser(tx: Prisma.TransactionClient, userId: string) {
  return await tx.user.delete({
    where: {
      id: userId,
    },
  });
}

export async function updateUserImage(
  userId: string,
  { image }: Pick<z.infer<typeof UpdateUserSchema>, "image">,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { image },
  });
}
