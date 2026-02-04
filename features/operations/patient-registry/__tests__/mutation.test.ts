import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { createLocalPatient, deleteLocalPatient } from "../dal/mutation";
import {
  deleteLocalPatientAction,
  syncLocalPatientHISAction,
  createLocalPatientHISAction,
  updateLocalPatientManualAction,
  createLocalPatientManualAction,
} from "../action/mutation";

jest.mock("@/auth", () => {
  return {
    __esModule: true,
    auth: jest.fn().mockResolvedValue(null),
  };
});

const LABORATORY_ID = "lab_id_1";

const sessionSysAdmin = {
  user: {
    name: "Sys Admin 1",
    role: "SYS_ADMIN" as const,
    username: "SYS_ADMIN_1",
    password: "SYS_ADMIN_1",
    laboratoryId: LABORATORY_ID,
  },
};

const sessionStaff = {
  user: {
    name: "STAFF 1",
    role: "STAFF" as const,
    username: "STAFF_1",
    password: "STAFF_1",
    laboratoryId: LABORATORY_ID,
  },
};

const initialLocalPatients: NonNullable<
  Awaited<ReturnType<typeof createLocalPatient>>
>[] = [];

beforeAll(async () => {
  process.env.HIS_SERVICE_TOKEN = "MONCIP_LIS-SVC_TKN";

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
  await createLocalPatient({
    name: "Bob" as string,
    gender: "M",
    source: "HIS",
    linkedAt: new Date(),
    dateOfBirth: new Date("2001-12-31"),
    laboratoryId: LABORATORY_ID,
    externalSystemId: "-",
  }).then((data) => {
    if (data) {
      initialLocalPatients.push(data);
    }
  });
});

describe("createLocalPatientManualAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 'Unauthenticated.' if no session", async () => {
    const validPayload = {
      name: "John Doe",
      gender: "M" as const,
      dateOfBirth: "2000-12-31",
    };

    await expect(createLocalPatientManualAction(validPayload)).rejects.toThrow(
      "Unauthenticated.",
    );
  });

  it("should throw 'Data is invalid.' if payload is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const invalidPayload = {
      name: "",
      gender: "M" as const,
      dateOfBirth: "not-a-date",
    };

    await expect(
      createLocalPatientManualAction(invalidPayload),
    ).rejects.toThrow("Data is invalid.");
  });

  it("should throw 'Unauthorized.' if user not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);

    const validPayload = {
      name: "John Doe",
      gender: "M" as const,
      dateOfBirth: "2000-12-31",
    };

    await expect(createLocalPatientManualAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should return data successfully when all is valid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = {
      name: "John Doe",
      gender: "M" as const,
      dateOfBirth: "2000-12-31",
    };

    const result = await createLocalPatientManualAction(validPayload);

    expect(result).toEqual({
      data: result.data,
      success: true,
      message: "Patient has been created successfully.",
    });
  });
});

describe("createLocalPatientHISAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 'Unauthenticated.' if no session", async () => {
    const validPayload = {
      externalSystemId: "HIS-00012345",
      laboratoryId: sessionSysAdmin.user.laboratoryId,
    };

    await expect(createLocalPatientHISAction(validPayload)).rejects.toThrow(
      "Unauthenticated.",
    );
  });

  it("should throw 'Data is invalid.' if payload is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const invalidPayload = {
      externalSystemId: "",
      laboratoryId: "",
    };

    await expect(createLocalPatientHISAction(invalidPayload)).rejects.toThrow(
      "Data is invalid.",
    );
  });

  it("should throw 'Unauthorized.' if user not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);

    const validPayload = {
      externalSystemId: "HIS-00012345",
      laboratoryId: sessionSysAdmin.user.laboratoryId,
    };

    await expect(createLocalPatientHISAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should throw 'Patient not found.' if HIS returns empty patients", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = {
      externalSystemId: "HIS-",
      laboratoryId: sessionSysAdmin.user.laboratoryId,
    };

    await expect(createLocalPatientHISAction(validPayload)).rejects.toThrow(
      "Patient not found.",
    );
  });

  it("should return data successfully when all is valid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = {
      externalSystemId: "HIS-00012345",
      laboratoryId: sessionSysAdmin.user.laboratoryId,
    };

    const result = await createLocalPatientHISAction(validPayload);

    expect(result).toEqual({
      data: result.data,
      success: true,
      message: "Patient has been created successfully.",
    });

    if (result.data?.id) {
      await deleteLocalPatient({ id: result.data.id });
    }
  });
});

describe("updateLocalPatientManualAction", () => {
  let patientHIS: (typeof initialLocalPatients)[number] | undefined;
  let patientManual: (typeof initialLocalPatients)[number] | undefined;

  beforeAll(() => {
    patientHIS = initialLocalPatients
      .filter(({ source }) => source === "HIS")
      .at(0);
    patientManual = initialLocalPatients
      .filter(({ source }) => source === "MANUAL")
      .at(0);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 'Unauthenticated.' if no session", async () => {
    const validPayload = {
      id: patientManual?.id ?? "",
      name: "John Doe (New)",
    };

    await expect(updateLocalPatientManualAction(validPayload)).rejects.toThrow(
      "Unauthenticated.",
    );
  });

  it("should throw 'Data is invalid.' if payload is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const invalidPayload = { id: patientManual?.id ?? "", name: "" };

    await expect(
      updateLocalPatientManualAction(invalidPayload),
    ).rejects.toThrow("Data is invalid.");
  });

  it("should throw 'Unauthorized.' if user not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);

    const validPayload = {
      id: patientManual?.id ?? "",
      name: "John Doe (New)",
    };

    await expect(updateLocalPatientManualAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should throw 'Unauthorized.' if patient is not found", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = { id: "non-existent-id", name: "John Doe (New)" };

    await expect(updateLocalPatientManualAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should throw 'Unauthorized.' if patient source is not MANUAL", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = {
      id: patientHIS?.id ?? "",
      name: "John Doe (New)",
    };

    await expect(updateLocalPatientManualAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should return data successfully when all is valid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = {
      id: patientManual?.id ?? "",
      name: "John Doe (New)",
    };

    const result = await updateLocalPatientManualAction(validPayload);

    expect(result).toEqual({
      data: result.data,
      success: true,
      message: "Patient has been updated successfully.",
    });
  });
});

describe("syncLocalPatientHISAction", () => {
  let patientHIS: (typeof initialLocalPatients)[number] | undefined;
  let patientManual: (typeof initialLocalPatients)[number] | undefined;
  let patientHISWithoutExternalId:
    | (typeof initialLocalPatients)[number]
    | undefined;

  beforeAll(() => {
    patientHIS = initialLocalPatients
      .filter(({ source }) => source === "HIS")
      .at(0);
    patientManual = initialLocalPatients
      .filter(({ source }) => source === "MANUAL")
      .at(0);
    patientHISWithoutExternalId = initialLocalPatients
      .filter(({ source }) => source === "HIS")
      .at(1);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 'Unauthenticated.' if no session", async () => {
    const validPayload = { id: patientHIS?.id ?? "" };

    await expect(syncLocalPatientHISAction(validPayload)).rejects.toThrow(
      "Unauthenticated.",
    );
  });

  it("should throw 'Data is invalid.' if payload is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const invalidPayload = { id: "" };

    await expect(syncLocalPatientHISAction(invalidPayload)).rejects.toThrow(
      "Data is invalid.",
    );
  });

  it("should throw 'Unauthorized.' if user not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);

    const validPayload = { id: patientHIS?.id ?? "" };

    await expect(syncLocalPatientHISAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should throw 'Unauthorized.' if patient is not found", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = { id: "non-existent-id" };

    await expect(syncLocalPatientHISAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should throw 'Unauthorized.' if patient source is not HIS", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = { id: patientManual?.id ?? "" };

    await expect(syncLocalPatientHISAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should throw 'Patient not found.' if HIS returns empty patients", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = { id: patientHISWithoutExternalId?.id ?? "" };

    await expect(syncLocalPatientHISAction(validPayload)).rejects.toThrow(
      "Patient not found.",
    );
  });

  it("should return data successfully when all is valid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = { id: patientHIS?.id ?? "" };

    const result = await syncLocalPatientHISAction(validPayload);

    expect(result).toEqual({
      data: result.data,
      success: true,
      message: "Patient has been updated successfully.",
    });
  });
});

describe("deleteLocalPatientAction", () => {
  let patientHIS: (typeof initialLocalPatients)[number] | undefined;

  beforeAll(() => {
    patientHIS = initialLocalPatients
      .filter(({ source }) => source === "HIS")
      .at(0);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 'Unauthenticated.' if no session", async () => {
    const validPayload = { id: patientHIS?.id ?? "" };

    await expect(deleteLocalPatientAction(validPayload)).rejects.toThrow(
      "Unauthenticated.",
    );
  });

  it("should throw 'Data is invalid.' if payload is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const invalidPayload = { id: "" };

    await expect(deleteLocalPatientAction(invalidPayload)).rejects.toThrow(
      "Data is invalid.",
    );
  });

  it("should throw 'Unauthorized.' if user not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionSysAdmin);

    const validPayload = { id: patientHIS?.id ?? "" };

    await expect(deleteLocalPatientAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should throw 'Unauthorized.' if patient is not found", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = { id: "non-existent-id" };

    await expect(deleteLocalPatientAction(validPayload)).rejects.toThrow(
      "Unauthorized.",
    );
  });

  it("should return data successfully when all is valid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(sessionStaff);

    const validPayload = { id: patientHIS?.id ?? "" };

    const result = await deleteLocalPatientAction(validPayload);

    expect(result).toEqual({
      data: result.data,
      success: true,
      message: "Patient has been deleted successfully.",
    });
  });
});
