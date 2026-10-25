"use server";

import { auth } from "@/auth";
import { UnauthenticatedError } from "./custom-errors/unauthenticated-error";

export async function ensureUserAuthenticated() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    throw new UnauthenticatedError();
  }

  return user;
}
