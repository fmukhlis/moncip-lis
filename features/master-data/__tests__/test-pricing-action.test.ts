import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { getTests } from "../dal/test-availability-query";
import { seedTariffGroup } from "@/lib/seed-master-tariff-group";
import { saveLocalTestsAction } from "../action/test-availability-action";
import {
  saveLocalTestPricesAction,
  updateLocalTestGroupAction,
  createLocalTestGroupAction,
  archiveLocalTestGroupAction,
  getLocalTestsWithPricesAction,
  unarchiveLocalTestGroupAction,
  getSupportedTariffGroupsAction,
  saveLocalTestGroupPricesAction,
  getLocalTestGroupsWithPricesAction,
} from "../action/test-pricing-action";
import {
  seedUnits,
  seedScales,
  seedMethods,
  seedLabTests,
  seedSpecimens,
  seedCategories,
} from "@/lib/seed-master-test";
import {
  createLocalTestGroup,
  archiveLocalTestGroup,
  getLocalTestsWithPrices,
  getLocalTestGroupsByCode,
  getSupportedTariffGroups,
} from "../dal/test-pricing-query";

jest.mock("@/auth", () => {
  return {
    esModule: true,
    auth: jest.fn().mockResolvedValue(null),
  };
});

const authenticatedUser = {
  user: {
    name: "Admin 1",
    role: "admin" as const,
    laboratoryId: "lab_id_1",
  },
};

beforeAll(async () => {
  await seedSpecimens();
  await seedMethods();
  await seedUnits();
  await seedCategories();
  await seedScales();
  await seedLabTests();

  await seedTariffGroup();

  await prisma.user.create({
    data: {
      name: authenticatedUser.user.name,
      role: authenticatedUser.user.role,
      laboratory: { create: { id: authenticatedUser.user.laboratoryId } },
    },
  });

  (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

  const labTestIds = (await getTests()).map(({ id }) => id);

  await saveLocalTestsAction({
    labTestIds,
  });
});

afterAll(async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
});

describe("getLocalTestsWithPricesAction", () => {
  it("returns a failure response when unauthorized", async () => {
    const response = await getLocalTestsWithPricesAction({});

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: [],
    });
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getLocalTestsWithPricesAction({ count: 0 });

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: [],
    });
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getLocalTestsWithPricesAction({});

    expect(response).toEqual({
      success: true,
      message: "Data was fetched successfully.",
      data: response.data,
    });
  });
});

describe("saveLocalTestPricesAction", () => {
  let pricesPayload: Parameters<typeof saveLocalTestPricesAction>[0]["prices"];
  let supportedTariffGroup: Awaited<
    ReturnType<typeof getSupportedTariffGroups>
  >;
  let laboratoriesOnLabTests: Awaited<
    ReturnType<typeof getLocalTestsWithPrices>
  >[number];

  beforeAll(async () => {
    laboratoriesOnLabTests = (
      await getLocalTestsWithPrices({
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
    const response = await saveLocalTestPricesAction({
      laboratoriesOnLabTestsId: laboratoriesOnLabTests.id,
      prices: pricesPayload,
    });

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: 0,
    });
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser);

    // Invalid tariff group id
    const response1 = await saveLocalTestPricesAction({
      laboratoriesOnLabTestsId: laboratoriesOnLabTests.id,
      prices: pricesPayload.map((item) => ({
        ...item,
        tariffGroupId: "nonexistent_tariff_group_id",
      })),
    });

    // Invalid price
    const response2 = await saveLocalTestPricesAction({
      laboratoriesOnLabTestsId: laboratoriesOnLabTests.id,
      prices: pricesPayload.map((item) => ({ ...item, price: "-10000" })),
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
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await saveLocalTestPricesAction({
      laboratoriesOnLabTestsId: laboratoriesOnLabTests.id,
      prices: pricesPayload,
    });

    expect(response).toEqual({
      success: true,
      message: "Test pricing were saved successfully.",
      data: response.data,
    });
  });
});

describe("createLocalTestGroupAction", () => {
  let payload: Parameters<typeof createLocalTestGroupAction>[0];
  let timestampString: string;
  let laboratoriesOnLabTests: Awaited<
    ReturnType<typeof getLocalTestsWithPrices>
  >;

  beforeAll(async () => {
    timestampString = Date.now().toString();

    laboratoriesOnLabTests = await getLocalTestsWithPrices({
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
    const response = await createLocalTestGroupAction(payload);

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: null,
    });
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await createLocalTestGroupAction({
      ...payload,
      laboratoriesOnLabTestsIds: [],
    });

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: null,
    });
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await createLocalTestGroupAction(payload);

    expect(response).toEqual({
      success: true,
      message: "Panel was created successfully.",
      data: response.data,
    });
  });
});

describe("updateLocalTestGroupAction", () => {
  let payload: Parameters<typeof updateLocalTestGroupAction>[0];
  let localTestGroup: Awaited<
    ReturnType<typeof getLocalTestGroupsByCode>
  >[number];
  let timestampString: string;
  let laboratoriesOnLabTests: Awaited<
    ReturnType<typeof getLocalTestsWithPrices>
  >;

  beforeAll(async () => {
    timestampString = Date.now().toString();

    laboratoriesOnLabTests = await getLocalTestsWithPrices({
      laboratoryId: authenticatedUser.user.laboratoryId,
      count: 3,
    });

    await createLocalTestGroup({
      code: timestampString,
      name: "Panel",
      description: "Some descriptions about panel...",
      laboratoryId: authenticatedUser.user.laboratoryId,
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    });

    localTestGroup = (
      await getLocalTestGroupsByCode({ code: timestampString })
    )[0];

    payload = {
      code: timestampString,
      name: "Panel",
      description: "Some descriptions about panel...",
      labTestGroupId: localTestGroup.id,
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    };
  });

  it("returns a failure response when unauthorized", async () => {
    const response = await updateLocalTestGroupAction(payload);

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: null,
    });
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await updateLocalTestGroupAction({
      ...payload,
      laboratoriesOnLabTestsIds: [],
    });

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: null,
    });
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await updateLocalTestGroupAction(payload);

    expect(response).toEqual({
      success: true,
      message: "Panel was updated successfully.",
      data: response.data,
    });
  });
});

describe("archiveLocalTestGroupAction", () => {
  let localTestGroup: Awaited<
    ReturnType<typeof getLocalTestGroupsByCode>
  >[number];
  let timestampString: string;
  let laboratoriesOnLabTests: Awaited<
    ReturnType<typeof getLocalTestsWithPrices>
  >;

  beforeAll(async () => {
    timestampString = Date.now().toString();

    laboratoriesOnLabTests = await getLocalTestsWithPrices({
      laboratoryId: authenticatedUser.user.laboratoryId,
      count: 3,
    });

    await createLocalTestGroup({
      code: timestampString,
      name: "Panel",
      description: "Some descriptions about panel...",
      laboratoryId: authenticatedUser.user.laboratoryId,
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    });

    localTestGroup = (
      await getLocalTestGroupsByCode({ code: timestampString })
    )[0];
  });

  it("returns a failure response when unauthorized", async () => {
    const response = await archiveLocalTestGroupAction({
      labTestGroupId: localTestGroup.id,
    });

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: null,
    });
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await archiveLocalTestGroupAction({
      labTestGroupId: "",
    });

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: null,
    });
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await archiveLocalTestGroupAction({
      labTestGroupId: localTestGroup.id,
    });

    expect(response).toEqual({
      success: true,
      message: "Panel was archived successfully.",
      data: null,
    });
  });
});

describe("unarchiveLocalTestGroupAction", () => {
  let localTestGroup: Awaited<
    ReturnType<typeof getLocalTestGroupsByCode>
  >[number];
  let timestampString: string;
  let laboratoriesOnLabTests: Awaited<
    ReturnType<typeof getLocalTestsWithPrices>
  >;

  beforeEach(async () => {
    timestampString = Date.now().toString();

    laboratoriesOnLabTests = await getLocalTestsWithPrices({
      laboratoryId: authenticatedUser.user.laboratoryId,
      count: 3,
    });

    await createLocalTestGroup({
      code: `${timestampString}`,
      name: "Panel",
      description: "Some descriptions about panel...",
      laboratoryId: authenticatedUser.user.laboratoryId,
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    });

    localTestGroup = (
      await getLocalTestGroupsByCode({ code: timestampString })
    )[0];

    await archiveLocalTestGroup({ labTestGroupId: localTestGroup.id });
  });

  it("returns a failure response when unauthorized", async () => {
    const response = await unarchiveLocalTestGroupAction({
      labTestGroupId: localTestGroup.id,
    });

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: null,
    });
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await unarchiveLocalTestGroupAction({
      labTestGroupId: "",
    });

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: null,
    });
  });

  it("returns a failure response when a non-existent local test group is selected", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await unarchiveLocalTestGroupAction({
      labTestGroupId: "nonexistent_local_test_group_id",
    });

    expect(response).toEqual({
      success: false,
      message: "Nonexistent test panel.",
      data: null,
    });
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

    const response = await unarchiveLocalTestGroupAction({
      labTestGroupId: localTestGroup.id,
    });

    expect(response).toEqual({
      success: false,
      message: "The code conflicts with another test panel.",
      data: null,
    });
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await unarchiveLocalTestGroupAction({
      labTestGroupId: localTestGroup.id,
    });

    expect(response).toEqual({
      success: true,
      message: "Panel was unarchived successfully.",
      data: null,
    });
  });
});

describe("getLocalTestGroupsWithPricesAction", () => {
  it("returns a failure response when unauthorized", async () => {
    const response = await getLocalTestGroupsWithPricesAction({});

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: [],
    });
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getLocalTestGroupsWithPricesAction({ count: 0 });

    expect(response).toEqual({
      success: false,
      message: "Invalid data.",
      data: [],
    });
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getLocalTestGroupsWithPricesAction({});

    expect(response).toEqual({
      success: true,
      message: "Data was fetched successfully.",
      data: response.data,
    });
  });
});

describe("saveLocalTestGroupPricesAction", () => {
  let pricesPayload: Parameters<
    typeof saveLocalTestGroupPricesAction
  >[0]["prices"];
  let localTestGroup: Awaited<
    ReturnType<typeof getLocalTestGroupsByCode>
  >[number];
  let timestampString: string;
  let laboratoriesOnLabTests: Awaited<
    ReturnType<typeof getLocalTestsWithPrices>
  >;
  let supportedTariffGroup: Awaited<
    ReturnType<typeof getSupportedTariffGroups>
  >;

  beforeEach(async () => {
    timestampString = Date.now().toString();

    laboratoriesOnLabTests = await getLocalTestsWithPrices({
      laboratoryId: authenticatedUser.user.laboratoryId,
      count: 3,
    });

    await createLocalTestGroup({
      code: `${timestampString}`,
      name: "Panel",
      description: "Some descriptions about panel...",
      laboratoryId: authenticatedUser.user.laboratoryId,
      laboratoriesOnLabTestsIds: laboratoriesOnLabTests.map(({ id }) => id),
    });

    localTestGroup = (
      await getLocalTestGroupsByCode({ code: timestampString })
    )[0];

    supportedTariffGroup = await getSupportedTariffGroups();

    pricesPayload = supportedTariffGroup.map(({ id }) => ({
      price: "10000",
      tariffGroupId: id,
    }));
  });

  it("returns a failure response when unauthorized", async () => {
    const response = await saveLocalTestGroupPricesAction({
      labTestGroupId: localTestGroup.id,
      prices: pricesPayload,
    });

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: 0,
    });
  });

  it("returns a failure response when data is invalid", async () => {
    (auth as jest.Mock)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(authenticatedUser);

    // Invalid tariff group id
    const response1 = await saveLocalTestGroupPricesAction({
      labTestGroupId: localTestGroup.id,
      prices: pricesPayload.map((item) => ({
        ...item,
        tariffGroupId: "nonexistent_tariff_group_id",
      })),
    });

    // Invalid price
    const response2 = await saveLocalTestGroupPricesAction({
      labTestGroupId: localTestGroup.id,
      prices: pricesPayload.map((item) => ({
        ...item,
        price: "-10000",
      })),
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
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await saveLocalTestGroupPricesAction({
      labTestGroupId: localTestGroup.id,
      prices: pricesPayload,
    });

    expect(response).toEqual({
      success: true,
      message: "Panel pricing were saved successfully.",
      data: response.data,
    });
  });
});

describe("getSupportedTariffGroupsAction", () => {
  it("returns a failure response when unauthorized", async () => {
    const response = await getSupportedTariffGroupsAction();

    expect(response).toEqual({
      success: false,
      message: "Authorization violations.",
      data: [],
    });
  });

  it("returns a success response", async () => {
    (auth as jest.Mock).mockResolvedValueOnce(authenticatedUser);

    const response = await getSupportedTariffGroupsAction();

    expect(response).toEqual({
      success: true,
      message: "Data was fetched successfully.",
      data: response.data,
    });
  });
});
