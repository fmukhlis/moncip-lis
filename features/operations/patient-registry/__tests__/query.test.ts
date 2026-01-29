import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { authorize } from "@/features/authentication/lib/authorize";
import { createLocalPatient } from "../dal/mutation";
import { getLocalPatientAction, getLocalPatientsAction } from "../action/query";

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

const initialLocalPatients: NonNullable<
  Awaited<ReturnType<typeof createLocalPatient>>
>[] = [];

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

  await createLocalPatient({
    name: "John Doe",
    gender: "M",
    source: "MANUAL",
    dateOfBirth: new Date("2001-12-31"),
    laboratoryId: LABORATORY_ID,
  }).then((data) => {
    if (data) {
      initialLocalPatients.push(data);
    }
  });
  await createLocalPatient({
    name: "Alice" as string,
    gender: "F",
    source: "HIS",
    linkedAt: new Date(),
    dateOfBirth: new Date("2001-12-31"),
    laboratoryId: LABORATORY_ID,
    externalSystemId: "HIS-00012347",
  }).then((data) => {
    if (data) {
      initialLocalPatients.push(data);
    }
  });
});

describe("getLocalPatientsAction", () => {
  const mockAuthorize = authorize as jest.MockedFunction<typeof authorize>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 'Unauthenticated.' if no session", async () => {
    await expect(getLocalPatientsAction()).rejects.toThrow("Unauthenticated.");
  });

  it("should throw 'Data is invalid.' if payload is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);

    const invalidPayload = { count: 0 };

    await expect(getLocalPatientsAction(invalidPayload)).rejects.toThrow(
      "Data is invalid.",
    );
  });

  it("should throw 'Unauthorized.' if user not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);
    mockAuthorize.mockReturnValueOnce(false);

    await expect(getLocalPatientsAction()).rejects.toThrow("Unauthorized.");
  });

  it("should return data successfully when all is valid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);
    mockAuthorize.mockReturnValueOnce(true);

    const validPayload = { count: 10 };

    const result = await getLocalPatientsAction(validPayload);

    expect(result).toEqual({
      data: result.data,
      success: true,
      message: "Data were fetched successfully.",
    });
  });
});

describe("getLocalPatientAction", () => {
  let patientHIS: (typeof initialLocalPatients)[number] | undefined;
  const mockAuthorize = authorize as jest.MockedFunction<typeof authorize>;

  beforeAll(async () => {
    patientHIS = initialLocalPatients
      .filter(({ source }) => source === "HIS")
      .at(0);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 'Unauthenticated.' if no session", async () => {
    const validPayload = { id: patientHIS?.id ?? "" };

    await expect(getLocalPatientAction(validPayload)).rejects.toThrow(
      "Unauthenticated.",
    );
  });

  it("should throw 'Data is invalid.' if payload is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);

    const invalidPayload = { id: "" };

    await expect(getLocalPatientAction(invalidPayload)).rejects.toThrow(
      "Data is invalid.",
    );
  });

  it("should throw 'Unauthorized.' if user not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);
    mockAuthorize.mockReturnValueOnce(false);

    const validPayload = { id: patientHIS?.id ?? "" };

    await expect(getLocalPatientAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should return data successfully when all is valid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);
    mockAuthorize.mockReturnValueOnce(true);

    const validPayload = { id: patientHIS?.id ?? "" };

    const result = await getLocalPatientAction(validPayload);

    expect(result).toEqual({
      data: result.data,
      success: true,
      message: "Data were fetched successfully.",
    });
  });
});
