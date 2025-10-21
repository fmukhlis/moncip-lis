import bcrypt from "bcryptjs";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import prisma from "./lib/prisma";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { Provider } from "next-auth/providers";
import { randomUUID } from "crypto";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserCredentials } from "./features/user/dal/query";
import { encode as defaultEncode } from "next-auth/jwt";
import { SignInWithCredentialsSchema } from "./features/authentication/schema";

const providers: Provider[] = [
  Credentials({
    credentials: {
      username: {},
      password: {},
    },
    authorize: async (credentials) => {
      const parsedCredentials =
        SignInWithCredentialsSchema.safeParse(credentials);

      if (parsedCredentials.success) {
        const { username, password } = parsedCredentials.data;
        const user = await getUserCredentials(username);

        if (user) {
          const isPasswordMatch = await bcrypt.compare(password, user.password);
          if (isPasswordMatch) {
            return user;
          }
        }
      }

      throw new Error("Invalid credentials.");
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

export const adapter = PrismaAdapter(prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/signin",
  },
  adapter,
  session: {
    maxAge: 43200,
    strategy: "database",
  },
  providers,
  callbacks: {
    async jwt({ account, token }) {
      if (account?.provider === "credentials" && token.sub) {
        const sessionToken = randomUUID();

        await adapter.createSession?.({
          expires: new Date(Date.now() + 43200),
          sessionToken,
          userId: token.sub,
        });

        token.sessionToken = sessionToken;
      }
      return token;
    },
    async session({ session }) {
      const { email, username, image, name, role, laboratoryId } = session.user;

      if (!session.user.laboratoryId && session.user.role === "admin") {
        await prisma.laboratory.create({
          data: { users: { connect: { id: session.user.id } } },
        });
      }

      return {
        expires: session.expires,
        user: { email, username, image, name, role, laboratoryId },
      };
    },
  },
  jwt: {
    async encode(params) {
      if (typeof params.token?.sessionToken === "string") {
        return params.token.sessionToken;
      }
      // Returning defaultEncode(params) when AdapterConfig.session.strategy is set to
      // 'database' will force the client browser to delete the jwt cookie immediately.
      // So unless the provider is credentials, we let the provider to handle the cookie itself.
      return defaultEncode(params);
    },
  },
});

declare module "next-auth" {
  interface User {
    role?: "admin" | "doctor" | "lab_tech";
    username?: string | null;
    laboratoryId?: string | null;
  }
}
