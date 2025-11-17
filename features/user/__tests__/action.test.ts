import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { downloadImage } from "@/lib/downloadImage";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
  importOAuthUserImageAction,
} from "../action";

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

jest.mock("@/lib/downloadImage", () => {
  return {
    __esModule: true,
    downloadImage: jest.fn(),
  };
});

describe("createUserAction", () => {
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
      message: "User was created successfully.",
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

describe("updateUserAction", () => {
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
      message: "User was updated successfully.",
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

describe("deleteUserAction", () => {
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

  it("deletes lab member and returns a success response", async () => {
    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await deleteUserAction("existing_doctor_id");

    expect(response).toEqual({
      success: true,
      message: "User was deleted successfully.",
      data: null,
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

    const response = await deleteUserAction("existing_doctor_id");

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: null,
    });
  });
});

describe("importOAuthUserImageAction", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        id: "admin_1_id",
        name: "Admin 1",
        role: "admin",
        image: "https://somedomain.com/admin_1.jpg",
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

  it("downloads user image locally, updates user image path in database and returns a success response", async () => {
    (downloadImage as unknown as jest.Mock).mockImplementationOnce(() => ({
      success: true,
      message: `Image was downloaded successfully.`,
      data: `/api/files/users/admin_1_id.jpg`,
    }));

    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        id: "admin_1_id",
        name: "Admin 1",
        role: "admin",
        image: "https://somedomain.com/admin_1.jpg",
        username: "admin_1",
        laboratoryId: "lab_id_1",
      },
    }));

    const session = await auth();

    const response = await importOAuthUserImageAction(session?.user);

    expect(response).toEqual({
      success: true,
      message: "Image was imported successfully.",
      data: null,
    });
  });

  it("returns a failed response when image is already imported", async () => {
    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        id: "admin_1_id",
        name: "Admin 1",
        role: "admin",
        image: "/api/files/users/admin_1_id.jpg",
        username: "admin_1",
        laboratoryId: "lab_id_1",
      },
    }));

    const session = await auth();

    const response = await importOAuthUserImageAction(session?.user);

    expect(response).toEqual({
      success: false,
      message: "Image doesn't exist or has already been imported.",
      data: null,
    });
  });
});
