"use server";

import z from "zod";
import prisma from "@/lib/prisma";
import saltAndHash from "@/lib/salt-and-hash";

import { CreateUserSchema } from "./schema";

export async function createUser(
  laboratoryId: string,
  data: z.infer<typeof CreateUserSchema>,
) {
  const parsedData = CreateUserSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, message: "Failed to create user.", data: data };
  }

  const { name, password, role, username } = parsedData.data;

  await prisma.user.create({
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

  return { success: true, message: "User created successfully.", data: data };
}
