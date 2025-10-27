"use server";

import z from "zod";

import { signIn } from "@/auth";
import { SignInWithCredentialsSchema } from "./schema";

export async function signInWithCredentials({
  data,
  callbackUrl,
}: {
  data: z.infer<typeof SignInWithCredentialsSchema>;
  callbackUrl?: string;
}) {
  const parsedData = SignInWithCredentialsSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, message: "Invalid credentials.", data };
  }

  try {
    await signIn("credentials", {
      ...data,
      redirectTo: callbackUrl ?? "/dashboard",
    });
  } catch (error) {
    throw error;
  }
}
