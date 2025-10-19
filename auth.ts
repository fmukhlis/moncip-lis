import bcrypt from "bcryptjs";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import prisma from "./lib/prisma";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import getUserByEmail from "./features/authentication/dal/query";

import { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { SignInWithCredentialsSchema } from "./features/authentication/schema";

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      const parsedCredentials =
        SignInWithCredentialsSchema.safeParse(credentials);

      if (parsedCredentials.success) {
        const { email, password } = parsedCredentials.data;
        const user = await getUserByEmail(email);

        if (user && user.password) {
          const isPasswordMatch = await bcrypt.compare(password, user.password);
          if (isPasswordMatch) {
            return user;
          }
        }

        throw new Error("Invalid credentials.");
      }

      return null;
    },
  }),
  Google,
  GitHub,
];

export const providerMap = providers
  .filter((provider) => typeof provider === "function")
  .map((provider) => {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
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
