import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { getTests, saveLocalTests } from "../dal/test-availability-query";
import {
  getLocalTestAction,
  getLocalTestsAction,
  getLocalTestGroupAction,
  getLocalTestGroupsAction,
  saveLocalTestPricesAction,
  createLocalTestGroupAction,
  archiveLocalTestGroupAction,
  markLocalTestOrderableAction,
  unarchiveLocalTestGroupAction,
  getSupportedTariffGroupsAction,
  saveLocalTestGroupPricesAction,
  markLocalTestNotOrderableAction,
  markLocalTestGroupOrderableAction,
  markLocalTestGroupNotOrderableAction,
} from "../action/test-pricing-action";
import {
  getLocalTests,
  getLocalTestGroups,
  createLocalTestGroup,
  archiveLocalTestGroup,
  getSupportedTariffGroups,
} from "../dal/test-pricing-query";

jest.mock("@/auth", () => {
  return {
    __esModule: true,
    auth: jest.fn().mockResolvedValue(null),
  };
});

const authenticatedUser = {
  user: {
    name: "Admin 1",
    role: "SYS_ADMIN" as const,
    laboratoryId: "lab_id_1",
  },
};

// Create an admin user, select all tests to user's lab, and create a dummy test group
beforeAll(async () => {
  await prisma.user.create({
    data: {
      name: authenticatedUser.user.name,
      role: authenticatedUser.user.role,
      laboratory: { create: { id: authenticatedUser.user.laboratoryId } },
    },
  });

  const labTestIds = (await getTests()).map(({ id }) => id);

  await saveLocalTests({
    laboratoryId: authenticatedUser.user.laboratoryId,
    labTestIds,
  });

  const laboratoriesOnLabTests = await getLocalTests({
    laboratoryId: authenticatedUser.user.laboratoryId,
    count: 3,
  });

  await createLocalTestGroup({
    code: Date.now().toString(),
    name: "Panel",
    description: "Some descriptions about panel...",
    laboratoryId: authenticatedUser.user.laboratoryId,
    laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
  });
});

// Local Test ----------------------------------------------
describe("getLocalTestsAction", () => {
  it("returns a failure response when unauthorized", async () => {
    await expect(getLocalTestsAction()).rejects.toThrow(
      "Authorization violations.",
    );
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(getLocalTestsAction({ count: -1 })).rejects.toThrow(
      "Invalid data.",
    );
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getLocalTestsAction({ count: 5 });

    expect(response).toEqual({
      success: true,
      message: "Data were fetched successfully.",
      data: response.data,
    });
  });
});

describe("getLocalTestAction", () => {
  let labTestId = "";

  beforeAll(async () => {
    labTestId = (await getTests())[0].id;
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(getLocalTestAction({ id: labTestId })).rejects.toThrow(
      "Authorization violations.",
    );
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(getLocalTestAction({ id: "" })).rejects.toThrow(
      "Invalid data.",
    );
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getLocalTestAction({ id: labTestId });

    expect(response).toEqual({
      success: true,
      message: "Data were fetched successfully.",
      data: response.data,
    });
  });
});

describe("markLocalTestOrderableAction", () => {
  let labTestId = "";

  beforeAll(async () => {
    labTestId = (
      await getLocalTests({ laboratoryId: authenticatedUser.user.laboratoryId })
    )[0].id;
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(
      markLocalTestOrderableAction({ id: labTestId }),
    ).rejects.toThrow("Authorization violations.");
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(markLocalTestOrderableAction({ id: "" })).rejects.toThrow(
      "Invalid data.",
    );
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await markLocalTestOrderableAction({ id: labTestId });

    expect(response).toEqual({
      success: true,
      message: "Test has been marked as orderable.",
      data: response.data,
    });
  });
});

describe("markLocalTestNotOrderableAction", () => {
  let labTestId = "";

  beforeAll(async () => {
    labTestId = (
      await getLocalTests({ laboratoryId: authenticatedUser.user.laboratoryId })
    )[0].id;
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(
      markLocalTestNotOrderableAction({
        id: labTestId,
        reason: "Reagents are out of stock",
      }),
    ).rejects.toThrow("Authorization violations.");
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(
      markLocalTestNotOrderableAction({
        id: "",
        reason: "Reagents are out of stock",
      }),
    ).rejects.toThrow("Invalid data.");
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await markLocalTestNotOrderableAction({
      id: labTestId,
      reason: "Reagents are out of stock",
    });

    expect(response).toEqual({
      success: true,
      message: "Test has been marked as not orderable.",
      data: response.data,
    });
  });
});

describe("saveLocalTestPricesAction", () => {
  let pricesPayload: Parameters<typeof saveLocalTestPricesAction>[0]["prices"];
  let supportedTariffGroup: Awaited<
    ReturnType<typeof getSupportedTariffGroups>
  >;
  let laboratoriesOnLabTests: Awaited<ReturnType<typeof getLocalTests>>[number];

  beforeAll(async () => {
    laboratoriesOnLabTests = (
      await getLocalTests({
        laboratoryId: authenticatedUser.user.laboratoryId,
      })
    )[0];

    supportedTariffGroup = await getSupportedTariffGroups();

    pricesPayload = supportedTariffGroup.map(({ id }) => ({
      price: "10000",
      tariffGroupId: id,
    }));
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(
      saveLocalTestPricesAction({
        id: laboratoriesOnLabTests.id,
        prices: pricesPayload,
      }),
    ).rejects.toThrow("Authorization violations.");
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser);

    // Invalid tariff group id
    await expect(
      saveLocalTestPricesAction({
        id: laboratoriesOnLabTests.id,
        prices: pricesPayload.map((item) => ({
          ...item,
          tariffGroupId: `invalid-${item.tariffGroupId}`,
        })),
      }),
    ).rejects.toThrow("Invalid data.");

    // Duplicate tariff group id
    await expect(
      saveLocalTestPricesAction({
        id: laboratoriesOnLabTests.id,
        prices: pricesPayload.map((item) => ({
          ...item,
          tariffGroupId: `ID`,
        })),
      }),
    ).rejects.toThrow("Invalid data.");

    // Invalid price
    await expect(
      saveLocalTestPricesAction({
        id: laboratoriesOnLabTests.id,
        prices: pricesPayload.map((item) => ({ ...item, price: "-10000" })),
      }),
    ).rejects.toThrow("Invalid data.");
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await saveLocalTestPricesAction({
      id: laboratoriesOnLabTests.id,
      prices: pricesPayload,
    });

    expect(response).toEqual({
      success: true,
      message: "Test prices have been saved successfully.",
      data: response.data,
    });
  });
});
// ---------------------------------------------- Local Test

// Local Test Group ----------------------------------------
describe("getLocalTestGroupsAction", () => {
  it("returns a failure response when unauthorized", async () => {
    await expect(getLocalTestGroupsAction()).rejects.toThrow(
      "Authorization violations.",
    );
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(getLocalTestGroupsAction({ count: -1 })).rejects.toThrow(
      "Invalid data.",
    );
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getLocalTestGroupsAction({ count: 5 });

    expect(response).toEqual({
      success: true,
      message: "Data were fetched successfully.",
      data: response.data,
    });
  });
});

describe("getLocalTestGroupAction", () => {
  let labTestGroupId = "";

  beforeAll(async () => {
    labTestGroupId = (
      await getLocalTestGroups({
        laboratoryId: authenticatedUser.user.laboratoryId,
      })
    )[0].id;
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(
      getLocalTestGroupAction({ id: labTestGroupId }),
    ).rejects.toThrow("Authorization violations.");
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(getLocalTestGroupAction({ id: "" })).rejects.toThrow(
      "Invalid data.",
    );
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getLocalTestGroupAction({ id: labTestGroupId });

    expect(response).toEqual({
      success: true,
      message: "Data were fetched successfully.",
      data: response.data,
    });
  });
});

describe("createLocalTestGroupAction", () => {
  let payload: Parameters<typeof createLocalTestGroupAction>[0];
  let timestampString: string;
  let laboratoriesOnLabTests: Awaited<ReturnType<typeof getLocalTests>>;

  beforeAll(async () => {
    timestampString = Date.now().toString();

    laboratoriesOnLabTests = await getLocalTests({
      laboratoryId: authenticatedUser.user.laboratoryId,
      count: 3,
    });

    payload = {
      code: timestampString,
      name: "Panel",
      description: "Some descriptions about panel...",
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    };
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(createLocalTestGroupAction(payload)).rejects.toThrow(
      "Authorization violations.",
    );
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(
      createLocalTestGroupAction({
        ...payload,
        laboratoriesOnLabTestsIds: [],
      }),
    ).rejects.toThrow("Invalid data.");
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await createLocalTestGroupAction(payload);

    expect(response).toEqual({
      success: true,
      message: "Panel has been created successfully.",
      data: response.data,
    });
  });
});

describe("archiveLocalTestGroupAction", () => {
  let localTestGroup: Awaited<ReturnType<typeof createLocalTestGroup>>;
  let timestampString: string;
  let laboratoriesOnLabTests: Awaited<ReturnType<typeof getLocalTests>>;

  beforeAll(async () => {
    timestampString = Date.now().toString();

    laboratoriesOnLabTests = await getLocalTests({
      laboratoryId: authenticatedUser.user.laboratoryId,
      count: 3,
    });

    localTestGroup = await createLocalTestGroup({
      code: timestampString,
      name: "Panel",
      description: "Some descriptions about panel...",
      laboratoryId: authenticatedUser.user.laboratoryId,
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    });
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(
      archiveLocalTestGroupAction({
        labTestGroupId: localTestGroup.id,
      }),
    ).rejects.toThrow("Authorization violations.");
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(
      archiveLocalTestGroupAction({
        labTestGroupId: "",
      }),
    ).rejects.toThrow("Invalid data.");
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await archiveLocalTestGroupAction({
      labTestGroupId: localTestGroup.id,
    });

    expect(response).toEqual({
      success: true,
      message: "Panel has been archived successfully.",
      data: null,
    });
  });
});

describe("unarchiveLocalTestGroupAction", () => {
  let localTestGroup: Awaited<ReturnType<typeof createLocalTestGroup>>;
  let timestampString: string;
  let laboratoriesOnLabTests: Awaited<ReturnType<typeof getLocalTests>>;

  beforeEach(async () => {
    timestampString = Date.now().toString();

    laboratoriesOnLabTests = await getLocalTests({
      laboratoryId: authenticatedUser.user.laboratoryId,
      count: 3,
    });

    localTestGroup = await createLocalTestGroup({
      code: `${timestampString}`,
      name: "Panel",
      description: "Some descriptions about panel...",
      laboratoryId: authenticatedUser.user.laboratoryId,
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    });

    await archiveLocalTestGroup({ labTestGroupId: localTestGroup.id });
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(
      unarchiveLocalTestGroupAction({
        labTestGroupId: localTestGroup.id,
      }),
    ).rejects.toThrow("Authorization violations.");
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(
      unarchiveLocalTestGroupAction({
        labTestGroupId: "",
      }),
    ).rejects.toThrow("Invalid data.");
  });

  it("returns a failure response when the code conflicts", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await createLocalTestGroup({
      code: timestampString,
      name: "Panel (New)",
      description: "Some descriptions about new panel...",
      laboratoryId: authenticatedUser.user.laboratoryId,
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    });

    await expect(
      unarchiveLocalTestGroupAction({
        labTestGroupId: localTestGroup.id,
      }),
    ).rejects.toThrow("The code conflicts with another test panel.");
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await unarchiveLocalTestGroupAction({
      labTestGroupId: localTestGroup.id,
    });

    expect(response).toEqual({
      success: true,
      message: "Panel has been unarchived successfully.",
      data: null,
    });
  });
});

describe("markLocalTestGroupOrderableAction", () => {
  let labTestGroupId = "";

  beforeAll(async () => {
    labTestGroupId = (
      await getLocalTestGroups({
        laboratoryId: authenticatedUser.user.laboratoryId,
      })
    )[0].id;
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(
      markLocalTestGroupOrderableAction({ id: labTestGroupId }),
    ).rejects.toThrow("Authorization violations.");
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(markLocalTestGroupOrderableAction({ id: "" })).rejects.toThrow(
      "Invalid data.",
    );
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await markLocalTestGroupOrderableAction({
      id: labTestGroupId,
    });

    expect(response).toEqual({
      success: true,
      message: "Panel has been marked as orderable.",
      data: response.data,
    });
  });
});

describe("markLocalTestGroupNotOrderableAction", () => {
  let labTestGroupId = "";

  beforeAll(async () => {
    labTestGroupId = (
      await getLocalTestGroups({
        laboratoryId: authenticatedUser.user.laboratoryId,
      })
    )[0].id;
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(
      markLocalTestGroupNotOrderableAction({
        id: labTestGroupId,
        reason: "Reagents are out of stock",
      }),
    ).rejects.toThrow("Authorization violations.");
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    await expect(
      markLocalTestGroupNotOrderableAction({
        id: "",
        reason: "Reagents are out of stock",
      }),
    ).rejects.toThrow("Invalid data.");
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await markLocalTestGroupNotOrderableAction({
      id: labTestGroupId,
      reason: "Reagents are out of stock",
    });

    expect(response).toEqual({
      success: true,
      message: "Panel has been marked as not orderable.",
      data: response.data,
    });
  });
});

describe("saveLocalTestGroupPricesAction", () => {
  let pricesPayload: Parameters<
    typeof saveLocalTestGroupPricesAction
  >[0]["prices"];
  let localTestGroup: Awaited<ReturnType<typeof createLocalTestGroup>>;
  let timestampString: string;
  let laboratoriesOnLabTests: Awaited<ReturnType<typeof getLocalTests>>;
  let supportedTariffGroup: Awaited<
    ReturnType<typeof getSupportedTariffGroups>
  >;

  beforeEach(async () => {
    timestampString = Date.now().toString();

    laboratoriesOnLabTests = await getLocalTests({
      laboratoryId: authenticatedUser.user.laboratoryId,
      count: 3,
    });

    localTestGroup = await createLocalTestGroup({
      code: `${timestampString}`,
      name: "Panel",
      description: "Some descriptions about panel...",
      laboratoryId: authenticatedUser.user.laboratoryId,
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    });

    supportedTariffGroup = await getSupportedTariffGroups();

    pricesPayload = supportedTariffGroup.map(({ id }) => ({
      price: "10000",
      tariffGroupId: id,
    }));
  });

  it("returns a failure response when unauthorized", async () => {
    await expect(
      saveLocalTestGroupPricesAction({
        labTestGroupId: localTestGroup.id,
        prices: pricesPayload,
      }),
    ).rejects.toThrow("Authorization violations.");
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser);

    // Invalid tariff group id
    await expect(
      saveLocalTestGroupPricesAction({
        labTestGroupId: localTestGroup.id,
        prices: pricesPayload.map((item) => ({
          ...item,
          tariffGroupId: `invalid-${item.tariffGroupId}`,
        })),
      }),
    ).rejects.toThrow("Invalid data.");

    // Duplicate tariff group id
    await expect(
      saveLocalTestGroupPricesAction({
        labTestGroupId: localTestGroup.id,
        prices: pricesPayload.map((item) => ({
          ...item,
          tariffGroupId: `ID`,
        })),
      }),
    ).rejects.toThrow("Invalid data.");

    // Invalid price
    await expect(
      saveLocalTestGroupPricesAction({
        labTestGroupId: localTestGroup.id,
        prices: pricesPayload.map((item) => ({
          ...item,
          price: "-10000",
        })),
      }),
    ).rejects.toThrow("Invalid data.");
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await saveLocalTestGroupPricesAction({
      labTestGroupId: localTestGroup.id,
      prices: pricesPayload,
    });

    expect(response).toEqual({
      success: true,
      message: "Panel prices have been saved successfully.",
      data: response.data,
    });
  });
});
// ---------------------------------------- Local Test Group

// Tariff Group ------------------------------------------->
describe("getSupportedTariffGroupsAction", () => {
  it("returns a failure response when unauthorized", async () => {
    await expect(getSupportedTariffGroupsAction()).rejects.toThrow(
      "Authorization violations.",
    );
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getSupportedTariffGroupsAction();

    expect(response).toEqual({
      success: true,
      message: "Data were fetched successfully.",
      data: response.data,
    });
  });
});
// -------------------------------------------- Tariff Group
