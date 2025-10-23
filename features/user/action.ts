"use server";

import z from "zod";

import { auth } from "@/auth";
import { createUser } from "./dal/query";
import { revalidatePath } from "next/cache";
import { CreateUserSchema } from "./schema";

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
