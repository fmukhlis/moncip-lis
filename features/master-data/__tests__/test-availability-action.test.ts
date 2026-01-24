import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { getTests } from "../dal/test-availability-query";
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

const authenticatedUser = {
  user: {
    name: "Admin 1",
    role: "sys_admin" as const,
    laboratoryId: "lab_id_1",
  },
};

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

describe("getTestCategoriesWithTestsAction", () => {
  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

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
  it("saves lab tests to own lab and returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

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
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

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
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

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
