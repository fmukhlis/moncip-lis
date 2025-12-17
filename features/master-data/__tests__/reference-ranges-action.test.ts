import z from "zod";
import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { getTests } from "../dal/test-availability-query";
import { saveLocalTestsAction } from "../action/test-availability-action";
import {
  saveLocalTestReferenceRangesAction,
  getLocalTestsWithReferenceRangesAction,
} from "../action/reference-ranges-action";
import {
  seedUnits,
  seedScales,
  seedMethods,
  seedLabTests,
  seedSpecimens,
  seedCategories,
} from "@/lib/seed-master-test";
import { SaveLocalTestReferenceRangesActionSchema } from "../schema/reference-ranges-schema";

jest.mock("@/auth", () => {
  return {
    __esModule: true,
    auth: jest.fn(() => ({
      user: undefined,
    })),
  };
});

const authenticated = () => ({
  user: {
    name: "Admin 1",
    role: "admin",
    laboratoryId: "lab_id_1",
  },
});

const getDummyNumericRefRanges = () =>
  [
    {
      kind: "numeric",
      ageMax: "150",
      ageMin: "0",
      gender: "M",
      valueLow: "13.0",
      valueHigh: "17.0",
    },
    {
      kind: "numeric",
      ageMax: "150",
      ageMin: "0",
      gender: "F",
      valueLow: "12.0",
      valueHigh: "16.0",
    },
  ] satisfies z.input<
    typeof SaveLocalTestReferenceRangesActionSchema
  >["refRanges"];

const getDummyNonNumericRefRanges = () =>
  [
    {
      kind: "non-numeric",
      ageMax: "150",
      ageMin: "0",
      gender: "B",
      normalValues: ["Negative"],
    },
  ] satisfies z.input<
    typeof SaveLocalTestReferenceRangesActionSchema
  >["refRanges"];

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

describe("getLocalTestsWithReferenceRangesAction", () => {
  it("returns a success response", async () => {
    (auth as jest.Mock).mockImplementationOnce(authenticated);

    const response = await getLocalTestsWithReferenceRangesAction();

    expect(response).toEqual({
      success: true,
      message: "Data was fetched successfully.",
      data: response.data,
    });
  });

  it("returns a failed response when unauthorized", async () => {
    const response = await getLocalTestsWithReferenceRangesAction();

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: [],
    });
  });
});

describe("saveReferenceRangesAction", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        name: "Admin 1",
        role: "admin",
        laboratory: { create: { id: "lab_id_1" } },
      },
    });

    (auth as jest.Mock).mockImplementationOnce(authenticated);

    const labTestIds = (await getTests()).map(({ id }) => id);

    await saveLocalTestsAction({ labTestIds });
  });

  it("saves local test reference ranges and returns a success response", async () => {
    (auth as jest.Mock)
      .mockImplementationOnce(authenticated)
      .mockImplementationOnce(authenticated)
      .mockImplementationOnce(authenticated)
      .mockImplementationOnce(authenticated);

    const laboratoriesOnLabTestsNumeric = (
      await getLocalTestsWithReferenceRangesAction()
    ).data.filter(({ labTest }) => labTest.code === "HEMOGLOBIN")[0];

    const laboratoriesOnLabTestsNonNumeric = (
      await getLocalTestsWithReferenceRangesAction()
    ).data.filter(
      ({ labTest }) => labTest.code === "URINE_GLUCOSE_DIPSTICK",
    )[0];

    const response1 = await saveLocalTestReferenceRangesAction({
      refRanges: getDummyNumericRefRanges(),
      defaultUnitId: laboratoriesOnLabTestsNumeric.labTest.units[0].id,
      laboratoriesOnLabTestsId: laboratoriesOnLabTestsNumeric.id,
    });

    const response2 = await saveLocalTestReferenceRangesAction({
      refRanges: getDummyNonNumericRefRanges(),
      laboratoriesOnLabTestsId: laboratoriesOnLabTestsNonNumeric.id,
    });

    expect(response1).toEqual({
      success: true,
      message: "Reference ranges were saved successfully.",
      data: 2,
    });

    expect(response2).toEqual({
      success: true,
      message: "Reference ranges were saved successfully.",
      data: 1,
    });
  });

  it("returns a failed response when unauthorized", async () => {
    const response = await saveLocalTestReferenceRangesAction({
      refRanges: [],
      defaultUnitId: "",
      laboratoriesOnLabTestsId: "",
    });

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: 0,
    });
  });

  it("returns a failed response when data is invalid", async () => {
    (auth as jest.Mock)
      .mockImplementationOnce(authenticated)
      .mockImplementationOnce(authenticated)
      .mockImplementationOnce(authenticated)
      .mockImplementationOnce(authenticated);

    const laboratoriesOnLabTestsHGB = (
      await getLocalTestsWithReferenceRangesAction()
    ).data.filter(({ labTest }) => labTest.code === "HEMOGLOBIN")[0];

    const laboratoriesOnLabTestsHCT = (
      await getLocalTestsWithReferenceRangesAction()
    ).data.filter(({ labTest }) => labTest.code === "HEMATOCRIT")[0];

    const response1 = await saveLocalTestReferenceRangesAction({
      refRanges: [],
      defaultUnitId: laboratoriesOnLabTestsHGB.labTest.units[0].id,
      laboratoriesOnLabTestsId: laboratoriesOnLabTestsHGB.id,
    });

    const response2 = await saveLocalTestReferenceRangesAction({
      refRanges: getDummyNumericRefRanges(),
      defaultUnitId: laboratoriesOnLabTestsHCT.labTest.units[0].id, // Intentionally using HCT unit instead of HGB
      laboratoriesOnLabTestsId: laboratoriesOnLabTestsHGB.id,
    });

    expect(response1).toEqual({
      success: false,
      message: "Invalid data.",
      data: 0,
    });

    expect(response2).toEqual({
      success: false,
      message: "Invalid data.",
      data: 0,
    });
  });
});
