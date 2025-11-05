"use server";

import z from "zod";

import { signIn, signOut } from "@/auth";
import { CredentialsSignin } from "next-auth";
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
      redirectTo: callbackUrl ?? "/admin/dashboard",
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { success: false, message: "Invalid credentials.", data };
    } else {
      throw error;
    }
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/signin" });
}
