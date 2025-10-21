"use server";

import z from "zod";

import { CreateUserSchema } from "./schema";
import { createUser } from "./dal/query";

export async function createUserAction(
  laboratoryId: string,
  data: z.infer<typeof CreateUserSchema>,
) {
  const parsedData = CreateUserSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, message: "Failed to create user.", data: data };
  }

  await createUser(laboratoryId, parsedData.data);

  return { success: true, message: "User created successfully.", data: data };
}
