"use server";

import z from "zod";

import { auth } from "@/auth";
import { SaveLocalTestReferenceRangesActionSchema } from "../schema";
import {
  getLocalTestsWithReferenceRanges,
  getSupportedUnitsForTest,
  saveLocalTestReferenceRanges,
} from "../dal/reference-ranges-query";

export async function getLocalTestsWithReferenceRangesAction() {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }

  const testsWithReferenceRanges = await getLocalTestsWithReferenceRanges({
    laboratoryId: session.user.laboratoryId,
  });

  return {
    success: true,
    message: "Data was fetched successfully.",
    data: testsWithReferenceRanges,
  };
}

export async function saveLocalTestReferenceRangesAction(
  data: z.input<typeof SaveLocalTestReferenceRangesActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: 0,
    };
  }

  const parsedData = SaveLocalTestReferenceRangesActionSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data.",
      data: 0,
    };
  }

  const supportedUnitsForTest = await getSupportedUnitsForTest({
    laboratoriesOnLabTestsId: parsedData.data.laboratoriesOnLabTestsId,
  });

  if (
    parsedData.data.defaultUnitId &&
    supportedUnitsForTest?.labTest.units.length
  ) {
    const setSupportedUnitIds = new Set(
      supportedUnitsForTest.labTest.units.map(({ id }) => id),
    );

    if (!setSupportedUnitIds.has(parsedData.data.defaultUnitId)) {
      return {
        success: false,
        message: "Invalid data.",
        data: 0,
      };
    }

    const referenceRangesCount = await saveLocalTestReferenceRanges({
      refRanges: parsedData.data.refRanges,
      defaultUnitId: parsedData.data.defaultUnitId,
      laboratoriesOnLabTestsId: parsedData.data.laboratoriesOnLabTestsId,
    });

    return {
      success: true,
      message: "Reference ranges were saved successfully.",
      data: referenceRangesCount,
    };
  } else {
    const referenceRangesCount = await saveLocalTestReferenceRanges({
      refRanges: parsedData.data.refRanges,
      laboratoriesOnLabTestsId: parsedData.data.laboratoriesOnLabTestsId,
    });

    return {
      success: true,
      message: "Reference ranges were saved successfully.",
      data: referenceRangesCount,
    };
  }
}
