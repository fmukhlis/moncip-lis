"use server";

import z from "zod";

import { auth } from "@/auth";
import {
  GetLocalTestsActionSchema,
  SaveLocalTestsActionSchema,
  GetTestCategoriesWithTestsActionSchema,
} from "../schema/test-availability-schema";
import {
  getTests,
  getLocalTests,
  saveLocalTests,
  getTestCategoriesWithTests,
} from "../dal/test-availability-query";

export async function getTestCategoriesWithTestsAction(
  payload?: z.input<typeof GetTestCategoriesWithTestsActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }

  const data = await getTestCategoriesWithTests(payload);

  return {
    success: true,
    message: "Data was fetched successfully.",
    data,
  };
}

export async function getLocalTestsAction(
  payload?: z.input<typeof GetLocalTestsActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }

  const localTests = await getLocalTests({
    ...payload,
    laboratoryId: session.user.laboratoryId,
  });

  return {
    success: true,
    message: "Data was fetched successfully.",
    data: localTests,
  };
}

export async function saveLocalTestsAction(
  data: z.input<typeof SaveLocalTestsActionSchema>,
) {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: 0,
    };
  }

  const parsedData = SaveLocalTestsActionSchema.safeParse(data);

  const validTestIds = new Set((await getTests()).map(({ id }) => id));

  if (
    !parsedData.success ||
    !parsedData.data.labTestIds.every((id) => validTestIds.has(id))
  ) {
    return {
      success: false,
      message: "Invalid data.",
      data: 0,
    };
  }

  const validLocalTestsCount = await saveLocalTests({
    labTestIds: parsedData.data.labTestIds,
    laboratoryId: session.user.laboratoryId,
  });

  return {
    success: true,
    message: "Laboratory tests were saved successfully.",
    data: validLocalTestsCount,
  };
}
