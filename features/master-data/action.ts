"use server";

import z from "zod";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { SaveLocalTestsSchema } from "./schema";
import {
  getLocalTests,
  getMasterTests,
  saveLocalTests,
  getMasterTestCategoriesDeep,
} from "./dal/query";

export async function getMasterTestCategoriesDeepAction() {
  const session = await auth();

  if (!session || !session.user) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }

  const data = await getMasterTestCategoriesDeep();

  return {
    success: true,
    message: "Success to fetch data.",
    data,
  };
}

export async function saveLocalTestsAction(
  data: z.infer<typeof SaveLocalTestsSchema>,
) {
  const session = await auth();

  const parsedData = SaveLocalTestsSchema.safeParse(data);

  const validTestCodes = new Set(
    (await getMasterTests()).map(({ code }) => code),
  );

  if (
    !parsedData.success ||
    !parsedData.data.labTestCodes.every((code) => validTestCodes.has(code))
  ) {
    return {
      success: false,
      message: "Invalid data.",
      data: [],
    };
  }

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: [],
    };
  }

  const lab = await saveLocalTests(
    session.user.laboratoryId,
    parsedData.data.labTestCodes,
  );

  revalidatePath("/admin/master-data/laboratory-tests/test-availability");

  return {
    success: true,
    message: "Laboratory tests were saved successfully.",
    data: lab.labTests,
  };
}

export async function getLocalTestsAction() {
  const session = await auth();

  if (!session || !session.user || !session.user.laboratoryId) {
    return {
      success: false,
      message: "Authorization violations.",
      data: null,
    };
  }

  const localTests = await getLocalTests(session.user.laboratoryId);

  return {
    success: true,
    message: "Success to fetch data.",
    data: localTests,
  };
}
