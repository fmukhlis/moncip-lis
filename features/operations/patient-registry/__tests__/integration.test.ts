import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { authorize } from "@/features/authentication/lib/authorize";
import { getPatientsFromHISAction } from "../action/integration";

jest.mock("@/auth", () => {
  return {
    __esModule: true,
    auth: jest.fn().mockResolvedValue(null),
  };
});
jest.mock("@/features/authentication/lib/authorize");

const LABORATORY_ID = "lab_id_1";

const sessionSysAdmin = {
  user: {
    name: "Sys Admin 1",
    role: "sys_admin" as const,
    username: "sys_admin_1",
    password: "sys_admin_1",
    laboratoryId: LABORATORY_ID,
  },
};

beforeAll(async () => {
  await prisma.user.create({
    data: {
      name: sessionSysAdmin.user.name,
      role: sessionSysAdmin.user.role,
      username: sessionSysAdmin.user.username,
      password: sessionSysAdmin.user.password,
      laboratory: {
        create: {
          id: sessionSysAdmin.user.laboratoryId,
        },
      },
    },
  });
});

describe("getPatientsFromHISAction", () => {
  const mockAuthorize = authorize as jest.MockedFunction<typeof authorize>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 'Unauthenticated.' if no session", async () => {
    const validPayload = { count: 10 };

    await expect(getPatientsFromHISAction(validPayload)).rejects.toThrow(
      "Unauthenticated.",
    );
  });

  it("should throw 'Data is invalid.' if payload is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);

    const invalidPayload = { count: -1, patientId: "" };

    await expect(getPatientsFromHISAction(invalidPayload)).rejects.toThrow(
      "Data is invalid.",
    );
  });

  it("should throw 'Unauthorized.' if user not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);
    mockAuthorize.mockReturnValueOnce(false);

    const validPayload = { count: 10 };

    await expect(getPatientsFromHISAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should return data successfully when all is valid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);
    mockAuthorize.mockReturnValueOnce(true);

    const validPayload = { count: 10 };

    const result = await getPatientsFromHISAction(validPayload);

    expect(result).toEqual({
      data: result.data,
      success: true,
      message: "Data were fetched successfully.",
    });
  });
});
