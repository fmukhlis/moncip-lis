import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import {
  seedUnits,
  seedScales,
  seedMethods,
  seedLabTests,
  seedSpecimens,
  seedCategories,
} from "@/lib/seed-master-test";
import {
  saveLocalTestsAction,
  getMasterTestCategoriesDeepAction,
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

beforeAll(async () => {
  await seedSpecimens();
  await seedMethods();
  await seedUnits();
  await seedCategories();
  await seedScales();
  await seedLabTests();
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

describe("getMasterTestCategoriesDeepAction", () => {
  it("returns a success response", async () => {
    (auth as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await getMasterTestCategoriesDeepAction();

    expect(response).toEqual({
      success: true,
      message: "Success to fetch data.",
      data: response.data,
    });
  });

  it("returns a failed response when unauthorized", async () => {
    const response = await getMasterTestCategoriesDeepAction();

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: [],
    });
  });
});

describe("saveLocalTestsAction", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        name: "Admin 1",
        role: "admin",
        laboratory: { create: { id: "lab_id_1" } },
      },
    });
  });

  it("saves lab tests to own lab and returns a success response", async () => {
    (auth as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await saveLocalTestsAction({
      labTestCodes: ["FASTING_GLUCOSE", "RANDOM_GLUCOSE"],
    });

    expect(response).toEqual({
      success: true,
      message: "Laboratory tests were saved successfully.",
      data: response.data,
    });
  });

  it("returns a failed response when data is invalid", async () => {
    (auth as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await saveLocalTestsAction({
      labTestCodes: ["NON_EXISTING_CODE"],
    });

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: [],
    });
  });

  it("returns a failed response when unauthorized", async () => {
    const response = await saveLocalTestsAction({
      labTestCodes: ["FASTING_GLUCOSE", "RANDOM_GLUCOSE"],
    });

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: [],
    });
  });
});
