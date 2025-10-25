"use server";

import z from "zod";

import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createUser, updateUser } from "./dal/query";
import { CreateUserSchema, UpdateUserSchema } from "./schema";

export async function createUserAction(data: z.infer<typeof CreateUserSchema>) {
  const session = await auth();

  const parsedData = CreateUserSchema.safeParse(data);

  if (session?.user?.role !== "admin" || !session.user.laboratoryId) {
    return { success: false, message: "Authorization violations.", data: data };
  }

  if (!parsedData.success) {
    return { success: false, message: "Invalid data.", data: data };
  }

  await createUser(session.user.laboratoryId, parsedData.data);

  revalidatePath("/admin/dashboard");

  return { success: true, message: "User created successfully.", data: data };
}

export async function updateUserAction(
  userId: string,
  data: z.infer<typeof UpdateUserSchema>,
) {
  const session = await auth();

  const parsedData = UpdateUserSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, message: "Invalid data.", data: data };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const user = await updateUser(tx, userId, parsedData.data);

      if (user.laboratoryId !== session?.user?.laboratoryId) {
        throw new Error();
      }
    });

    revalidatePath("/admin/dashboard");

    return { success: true, message: "User updated successfully.", data: data };
  } catch (error) {
    return { success: false, message: "Authorization violations.", data: data };
  }
}
