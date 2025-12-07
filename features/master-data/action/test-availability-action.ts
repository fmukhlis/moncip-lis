"use server";

import z from "zod";

import { auth } from "@/auth";
import { SaveLocalTestsActionSchema } from "../schema";
import {
  getTests,
  getLocalTests,
  saveLocalTests,
  getTestCategoriesWithTests,
} from "../dal/test-availability-query";

export async function getTestCategoriesWithTestsAction() {
  const session = await auth();

  if (!session || !session.user) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }

  const data = await getTestCategoriesWithTests();

  return {
    success: true,
    message: "Data was fetched successfully.",
    data,
  };
}

export async function saveLocalTestsAction(
  data: z.infer<typeof SaveLocalTestsActionSchema>,
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

export async function getLocalTestsAction() {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }

  const localTests = await getLocalTests({
    laboratoryId: session.user.laboratoryId,
  });

  return {
    success: true,
    message: "Data was fetched successfully.",
    data: localTests,
  };
}
