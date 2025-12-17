import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { getTests } from "../dal/test-availability-query";
import {
  seedUnits,
  seedScales,
  seedMethods,
  seedLabTests,
  seedSpecimens,
  seedCategories,
} from "@/lib/seed-master-test";
import {
  getLocalTestsAction,
  saveLocalTestsAction,
  getTestCategoriesWithTestsAction,
} from "../action/test-availability-action";

jest.mock("@/auth", () => {
  return {
    __esModule: true,
    auth: jest.fn(() => ({
      user: undefined,
    })),
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

describe("getTestCategoriesWithTestsAction", () => {
  it("returns a success response", async () => {
    (auth as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await getTestCategoriesWithTestsAction();

    expect(response).toEqual({
      success: true,
      message: "Data was fetched successfully.",
      data: response.data,
    });
  });

  it("returns a failed response when unauthorized", async () => {
    const response = await getTestCategoriesWithTestsAction();

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

    const labTestIds = (await getTests()).map(({ id }) => id);

    const response = await saveLocalTestsAction({
      labTestIds,
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
      labTestIds: ["NON_EXISTING_ID"],
    });

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: 0,
    });
  });

  it("returns a failed response when unauthorized", async () => {
    const labTestIds = (await getTests()).map(({ id }) => id);

    const response = await saveLocalTestsAction({
      labTestIds,
    });

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: 0,
    });
  });
});

describe("getLocalTestsAction", () => {
  it("returns a success response", async () => {
    (auth as jest.Mock).mockImplementationOnce(() => ({
      user: {
        name: "Admin 1",
        role: "admin",
        laboratoryId: "lab_id_1",
      },
    }));

    const response = await getLocalTestsAction();

    expect(response).toEqual({
      success: true,
      message: "Data was fetched successfully.",
      data: response.data,
    });
  });

  it("returns a failed response when unauthorized", async () => {
    const response = await getLocalTestsAction();

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: [],
    });
  });
});
