import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { createUserAction, updateUserAction } from "../action";

jest.mock("@/auth", () => {
  return {
    __esModule: true,
    auth: jest.fn(() => ({
      user: undefined,
    })),
  };
});

jest.mock("next/cache", () => {
  return {
    __esModule: true,
    revalidatePath: jest.fn(),
  };
});

const validUserPayload = {
  name: "Dr. Crocus",
  password: "dr_crocus_password",
  role: "doctor" as const,
  username: "dr_crocus",
};

const invalidUserPayload = {
  name: "Garp",
  password: "garp", // Password rule violation
  role: "lab_tech" as const,
  username: "garp",
};

describe("createUser()", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
        laboratory: { create: { id: "lab_id_1" } },
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

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("creates user as the lab member and returns a success response", async () => {
    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await createUserAction(validUserPayload);

    expect(response).toEqual({
      success: true,
      message: "User created successfully.",
      data: validUserPayload,
    });
  });

  it("returns a failed response when data is invalid", async () => {
    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await createUserAction(invalidUserPayload);

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: invalidUserPayload,
    });
  });

  it("returns a failed response when unauthorized", async () => {
    const response = await createUserAction(validUserPayload);

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: validUserPayload,
    });
  });
});

describe("updateUser()", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
        laboratory: { create: { id: "lab_id_1" } },
      },
    });

    await prisma.user.create({
      data: {
        name: "Admin 2",
        role: "admin",
        username: "admin_2",
        laboratory: { create: { id: "lab_id_2" } },
      },
    });

    await prisma.user.create({
      data: {
        id: "existing_doctor_id",
        name: "Existing doctor",
        role: "doctor",
        username: "existing_doctor",
        laboratory: { connect: { id: "lab_id_1" } },
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

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("updates lab member's data and returns a success response", async () => {
    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await updateUserAction(
      "existing_doctor_id",
      validUserPayload,
    );

    expect(response).toEqual({
      success: true,
      message: "User updated successfully.",
      data: validUserPayload,
    });
  });

  it("returns a failed response when data is invalid", async () => {
    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await updateUserAction(
      "existing_doctor_id",
      invalidUserPayload,
    );

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: invalidUserPayload,
    });
  });

  it("returns a failed response when unauthorized", async () => {
    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 2",
        role: "admin",
        username: "admin_2",
        laboratoryId: "lab_id_2",
      },
    }));

    const response = await updateUserAction(
      "existing_doctor_id",
      validUserPayload,
    );

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: validUserPayload,
    });
  });
});
