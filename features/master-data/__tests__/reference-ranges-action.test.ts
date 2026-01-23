import z from "zod";
import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { getTests, saveLocalTests } from "../dal/test-availability-query";
import { SaveLocalTestReferenceRangesActionSchema } from "../schema/reference-ranges-schema";
import {
  saveLocalTestReferenceRangesAction,
  getLocalTestsWithReferenceRangesAction,
} from "../action/reference-ranges-action";

jest.mock("@/auth", () => {
  return {
    __esModule: true,
    auth: jest.fn(() => ({
      user: undefined,
    })),
  };
});

const authenticatedUser = {
  user: {
    name: "Admin 1",
    role: "sys_admin" as const,
    laboratoryId: "lab_id_1",
  },
};

const getDummyNumericRefRanges = () =>
  [
    {
      kind: "numeric",
      ageMax: "150",
      ageMaxUnit: "M",
      ageMin: "0",
      ageMinUnit: "M",
      gender: "M",
      valueLow: "13.0",
      valueHigh: "17.0",
    },
    {
      kind: "numeric",
      ageMax: "150",
      ageMaxUnit: "M",
      ageMin: "0",
      ageMinUnit: "M",
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
      ageMaxUnit: "M",
      ageMin: "0",
      ageMinUnit: "M",
      gender: "B",
      normalValues: ["Negative"],
    },
  ] satisfies z.input<
    typeof SaveLocalTestReferenceRangesActionSchema
  >["refRanges"];

const overlapAgeRangeNumericRefRanges = [
  {
    kind: "numeric",
    ageMax: "150",
    ageMaxUnit: "M",
    ageMin: "0",
    ageMinUnit: "M",
    gender: "B",
    valueLow: "13.0",
    valueHigh: "17.0",
  },
  {
    kind: "numeric",
    ageMax: "300",
    ageMaxUnit: "M",
    ageMin: "150",
    ageMinUnit: "M",
    gender: "B",
    valueLow: "15.0",
    valueHigh: "19.0",
  },
] satisfies z.input<
  typeof SaveLocalTestReferenceRangesActionSchema
>["refRanges"];

const invalidValueRangeNumericRefRanges = [
  {
    kind: "numeric",
    ageMax: "150",
    ageMaxUnit: "M",
    ageMin: "0",
    ageMinUnit: "M",
    gender: "B",
    valueLow: "17.0",
    valueHigh: "13.0",
  },
] satisfies z.input<
  typeof SaveLocalTestReferenceRangesActionSchema
>["refRanges"];

const invalidAgeRangeNumericRefRanges = [
  {
    kind: "numeric",
    ageMax: "0",
    ageMaxUnit: "M",
    ageMin: "150",
    ageMinUnit: "M",
    gender: "B",
    valueLow: "13.0",
    valueHigh: "17.0",
  },
] satisfies z.input<
  typeof SaveLocalTestReferenceRangesActionSchema
>["refRanges"];

// Create an admin user
beforeAll(async () => {
  await prisma.user.create({
    data: {
      name: authenticatedUser.user.name,
      role: authenticatedUser.user.role,
      laboratory: { create: { id: authenticatedUser.user.laboratoryId } },
    },
  });
});

describe("getLocalTestsWithReferenceRangesAction", () => {
  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

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
    const labTestIds = (await getTests()).map(({ id }) => id);

    await saveLocalTests({
      labTestIds,
      laboratoryId: authenticatedUser.user.laboratoryId,
    });
  });

  it("saves local test reference ranges and returns a success response", async () => {
    (auth as jest.Mock)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser);

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
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser);

    const laboratoriesOnLabTestsHGB = (
      await getLocalTestsWithReferenceRangesAction()
    ).data.filter(({ labTest }) => labTest.code === "HEMOGLOBIN")[0];

    const laboratoriesOnLabTestsHCT = (
      await getLocalTestsWithReferenceRangesAction()
    ).data.filter(({ labTest }) => labTest.code === "HEMATOCRIT")[0];

    // Empty refRanges
    const response1 = await saveLocalTestReferenceRangesAction({
      refRanges: [],
      defaultUnitId: laboratoriesOnLabTestsHGB.labTest.units[0].id,
      laboratoriesOnLabTestsId: laboratoriesOnLabTestsHGB.id,
    });

    // Intentionally using wrong unit id (HCT instead of HGB)
    const response2 = await saveLocalTestReferenceRangesAction({
      refRanges: getDummyNumericRefRanges(),
      defaultUnitId: laboratoriesOnLabTestsHCT.labTest.units[0].id,
      laboratoriesOnLabTestsId: laboratoriesOnLabTestsHGB.id,
    });

    // Age range overlap
    const response3 = await saveLocalTestReferenceRangesAction({
      refRanges: overlapAgeRangeNumericRefRanges,
      defaultUnitId: laboratoriesOnLabTestsHCT.labTest.units[0].id,
      laboratoriesOnLabTestsId: laboratoriesOnLabTestsHGB.id,
    });

    // Age range is inverted
    const response4 = await saveLocalTestReferenceRangesAction({
      refRanges: invalidAgeRangeNumericRefRanges,
      defaultUnitId: laboratoriesOnLabTestsHCT.labTest.units[0].id,
      laboratoriesOnLabTestsId: laboratoriesOnLabTestsHGB.id,
    });

    // Value range is inverted
    const response5 = await saveLocalTestReferenceRangesAction({
      refRanges: invalidValueRangeNumericRefRanges,
      defaultUnitId: laboratoriesOnLabTestsHCT.labTest.units[0].id,
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

    expect(response3).toEqual({
      success: false,
      message: "Invalid data.",
      data: 0,
    });

    expect(response4).toEqual({
      success: false,
      message: "Invalid data.",
      data: 0,
    });

    expect(response5).toEqual({
      success: false,
      message: "Invalid data.",
      data: 0,
    });
  });
});
