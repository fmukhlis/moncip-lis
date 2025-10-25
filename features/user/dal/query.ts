import z from "zod";
import prisma from "@/lib/prisma";
import saltAndHash from "@/lib/salt-and-hash";

import { Prisma } from "@/generated/prisma";
import { CreateUserSchema, UpdateUserSchema } from "../schema";

export async function getUserCredentials(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  return user?.username && user.password
    ? {
        username: user.username,
        password: user.password,
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
