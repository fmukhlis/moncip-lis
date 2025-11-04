import { auth } from "@/auth";
import { createLaboratoryAction } from "../action";
import prisma from "@/lib/prisma";

jest.mock("@/auth", () => {
  return {
    __esModule: true,
    auth: jest.fn(() => ({
      user: undefined,
    })),
  };
});

describe("createLaboratoryAction", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        id: "admin_1_id",
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
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

  it("creates new laboratory for the admin user passed when the admin doesn't have any yet and returns a success response", async () => {
    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        id: "admin_1_id",
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
      },
    }));

    const session = await auth();

    const response = await createLaboratoryAction(session?.user);

    expect(response).toEqual({
      success: true,
      message: "Laboratory created successfully.",
      data: null,
    });
  });

  it("returns a failed response when user is not an admin or is alerady have a laboratory", async () => {
    (auth as unknown as jest.Mock).mockImplementationOnce(() => ({
      user: {
        id: "admin_1_id",
        name: "Admin 1",
        role: "admin",
        username: "admin_1",
        laboratoryId: "admin_1_lab_id",
      },
    }));

    const session = await auth();

    const response = await createLaboratoryAction(session?.user);

    expect(response).toEqual({
      success: false,
      message: "User already has a laboratory or lacks privileges.",
      data: null,
    });
  });
});
