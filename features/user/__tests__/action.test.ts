import prisma from "@/lib/prisma";

import { createUserAction } from "../action";

jest.mock("@/auth", () => {
  return {
    __esModule: true,
    auth: () => ({
      user: {
        name: "admin",
        role: "admin",
        username: "admin",
        laboratoryId: "random_lab_id",
      },
    }),
  };
});

describe("createUser()", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        name: "admin",
        role: "admin",
        username: "admin",
        laboratory: { create: { id: "random_lab_id" } },
      },
    });
  });

  afterAll(async () => {
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== "_prisma_migrations")
      .map((name) => `"public"."${name}"`)
      .join(", ");

    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  });

  it("creates user as the lab member and return success response", async () => {
    const testUser = {
      name: "test_user",
      password: "test_password",
      role: "doctor" as const,
      username: "test_user",
    };

    const response = await createUserAction(testUser);

    expect(response).toEqual({
      success: true,
      message: "User created successfully.",
      data: testUser,
    });
  });

  it("returns failed response when data is invalid", async () => {
    const invalidUser = {
      name: "invalid",
      password: "invalid",
      role: "doctor" as const,
      username: "invalid",
    };

    const response = await createUserAction(invalidUser);

    expect(response).toEqual({
      success: false,
      message: "Failed to create user.",
      data: invalidUser,
    });
  });
});
