import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import prisma from "./lib/prisma";
import NextAuth from "next-auth";

import { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";

const providers: Provider[] = [Google, GitHub];

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  } else {
    return { id: provider.id, name: provider.name };
  }
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/signin",
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers,
  callbacks: {
    session({ session, user }) {
      session.user.role = user.role;
      return session;
    },
  },
});

declare module "next-auth" {
  interface User {
    role?: "admin" | "doctor" | "lab_tech";
  }
}
