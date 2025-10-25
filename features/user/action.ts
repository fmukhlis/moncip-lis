"use server";

import z from "zod";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createUser, updateUser } from "./dal/query";
import { CreateUserSchema, UpdateUserSchema } from "./schema";

export async function createUserAction(data: z.infer<typeof CreateUserSchema>) {
  const session = await auth();

  const parsedData = CreateUserSchema.safeParse(data);

  if (
    !parsedData.success ||
    session?.user?.role !== "admin" ||
    !session.user.laboratoryId
  ) {
    return { success: false, message: "Failed to create user.", data: data };
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

  if (
    !parsedData.success ||
    session?.user?.role !== "admin" ||
    !session.user.laboratoryId
  ) {
    return { success: false, message: "Failed to update user.", data: data };
  }

  await updateUser(userId, parsedData.data);

  revalidatePath("/admin/dashboard");

  return { success: true, message: "User updated successfully.", data: data };
}
