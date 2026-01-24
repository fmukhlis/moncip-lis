import z from "zod";
import prisma from "@/lib/prisma";

import { formatISO } from "date-fns";
import {
  GetLocalTestSchema,
  GetLocalTestsSchema,
  GetLocalTestGroupSchema,
  GetLocalTestGroupsSchema,
  SaveLocalTestPricesSchema,
  CreateLocalTestGroupSchema,
  ArchiveLocalTestGroupSchema,
  MarkLocalTestOrderableSchema,
  UnarchiveLocalTestGroupSchema,
  GetLocalTestGroupsByCodeSchema,
  SaveLocalTestGroupPricesSchema,
  MarkLocalTestNotOrderableSchema,
  MarkLocalTestGroupOrderableSchema,
  MarkLocalTestGroupNotOrderableSchema,
} from "../schema/test-pricing-schema";

// Local Test
export async function getLocalTests(
  payload: z.infer<typeof GetLocalTestsSchema>,
) {
  const rawData = await prisma.laboratoriesOnLabTests.findMany({
    where: { laboratoryId: payload.laboratoryId },
    select: {
      id: true,
      prices: {
        where: { validTo: null },
        select: { id: true, price: true },
        orderBy: { price: "asc" },
      },
      labTest: {
        select: {
          id: true,
          code: true,
          name: true,
          category: { select: { id: true, name: true } },
        },
      },
      deletedAt: true,
      defaultUnit: { select: { id: true, displayCode: true } },
      notOrderableReason: true,
    },
    take: payload.count,
    orderBy: { labTest: { name: "asc" } },
  });

  return rawData.map(({ prices, deletedAt, ...rest }) => ({
    ...rest,
    validPrices: prices.map(({ price, ...rest }) => ({
      ...rest,
      price: price.toString(),
    })),
    deletedAt: deletedAt ? formatISO(deletedAt) : null,
  }));
}

export async function getLocalTest(
  payload: z.infer<typeof GetLocalTestSchema>,
) {
  const rawData = await prisma.laboratoriesOnLabTests.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      prices: {
        select: {
          id: true,
          price: true,
          validTo: true,
          validFrom: true,
          tariffGroup: { select: { id: true, code: true, name: true } },
        },
        take: payload.priceCount,
        orderBy: { validFrom: "desc" },
      },
      labTest: {
        select: {
          id: true,
          code: true,
          name: true,
          category: { select: { id: true, name: true } },
        },
      },
      deletedAt: true,
      defaultUnit: { select: { id: true, displayCode: true } },
      notOrderableReason: true,
    },
  });

  return rawData
    ? {
        ...rawData,
        prices: rawData.prices.map(
          ({ price, validFrom, validTo, ...rest }) => ({
            ...rest,
            price: price.toString(),
            validTo: validTo ? formatISO(validTo) : null,
            validFrom: formatISO(validFrom),
          }),
        ),
        deletedAt: rawData.deletedAt ? formatISO(rawData.deletedAt) : null,
      }
    : null;
}

export async function markLocalTestOrderable(
  payload: z.infer<typeof MarkLocalTestOrderableSchema>,
) {
  const rawData = await prisma.laboratoriesOnLabTests.update({
    where: { id: payload.id },
    data: { notOrderableReason: null },
    select: {
      id: true,
      labTestId: true,
      deletedAt: true,
      defaultUnitId: true,
      notOrderableReason: true,
    },
  });

  return {
    ...rawData,
    deletedAt: rawData.deletedAt ? formatISO(rawData.deletedAt) : null,
  };
}

export async function markLocalTestNotOrderable(
  payload: z.infer<typeof MarkLocalTestNotOrderableSchema>,
) {
  const rawData = await prisma.laboratoriesOnLabTests.update({
    where: { id: payload.id },
    data: { notOrderableReason: payload.reason },
    select: {
      id: true,
      labTestId: true,
      deletedAt: true,
      defaultUnitId: true,
      notOrderableReason: true,
    },
  });

  return {
    ...rawData,
    deletedAt: rawData.deletedAt ? formatISO(rawData.deletedAt) : null,
  };
}

export async function saveLocalTestPrices(
  payload: z.infer<typeof SaveLocalTestPricesSchema>,
) {
  await prisma.price.updateMany({
    where: {
      laboratoriesOnLabTestsId: payload.id,
      validTo: null,
    },
    data: { validTo: new Date() },
  });

  await prisma.laboratoriesOnLabTests.update({
    where: { id: payload.id },
    data: {
      prices: {
        createMany: {
          data: payload.prices.map(({ price, tariffGroupId }) => ({
            price,
            tariffGroupId,
          })),
        },
      },
    },
  });
}

// Local Test Group
export async function getLocalTestGroups(
  payload: z.infer<typeof GetLocalTestGroupsSchema>,
) {
  const rawData = await prisma.labTestGroup.findMany({
    where: { laboratoryId: payload.laboratoryId },
    select: {
      id: true,
      code: true,
      name: true,
      prices: {
        where: { validTo: null },
        select: { id: true, price: true },
        orderBy: { price: "asc" },
      },
      deletedAt: true,
      notOrderableReason: true,
    },
    take: payload.count,
    orderBy: { name: "asc" },
  });

  return rawData.map(({ deletedAt, prices, ...rest }) => ({
    ...rest,
    validPrices: prices.map(({ price, ...restPrices }) => ({
      ...restPrices,
      price: price.toString(),
    })),
    deletedAt: deletedAt ? formatISO(deletedAt) : null,
  }));
}

export async function getLocalTestGroup(
  payload: z.infer<typeof GetLocalTestGroupSchema>,
) {
  const rawData = await prisma.labTestGroup.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      code: true,
      name: true,
      prices: {
        select: {
          id: true,
          price: true,
          validTo: true,
          validFrom: true,
          tariffGroup: { select: { id: true, code: true, name: true } },
        },
        take: payload.priceCount,
        orderBy: { validFrom: "desc" },
      },
      deletedAt: true,
      laboratoriesOnLabTests: {
        select: {
          id: true,
          prices: {
            where: { validTo: null },
            select: { id: true, price: true },
            orderBy: { price: "asc" },
          },
          labTest: {
            select: {
              id: true,
              code: true,
              name: true,
              category: { select: { id: true, name: true } },
            },
          },
          deletedAt: true,
          defaultUnit: { select: { id: true, displayCode: true } },
          notOrderableReason: true,
        },
      },
      notOrderableReason: true,
    },
  });

  return rawData
    ? {
        ...rawData,
        prices: rawData.prices.map(
          ({ price, validFrom, validTo, ...restPrices }) => ({
            ...restPrices,
            price: price.toString(),
            validTo: validTo ? formatISO(validTo) : null,
            validFrom: formatISO(validFrom),
          }),
        ),
        deletedAt: rawData.deletedAt ? formatISO(rawData.deletedAt) : null,
        laboratoriesOnLabTests: rawData.laboratoriesOnLabTests.map(
          ({ deletedAt, prices, ...restLaboratoriesOnLabTests }) => ({
            ...restLaboratoriesOnLabTests,
            validPrices: prices.map(({ price, ...restPrices }) => ({
              ...restPrices,
              price: price.toString(),
            })),
            deletedAt: deletedAt ? formatISO(deletedAt) : null,
          }),
        ),
      }
    : null;
}

export async function createLocalTestGroup(
  payload: z.infer<typeof CreateLocalTestGroupSchema>,
) {
  const rawData = await prisma.laboratory.update({
    where: { id: payload.laboratoryId },
    data: {
      labTestGroups: {
        create: {
          code: payload.code,
          name: payload.name,
          description: payload.description,
          laboratoriesOnLabTests: {
            connect: payload.laboratoriesOnLabTestsIds.map((id) => ({ id })),
          },
        },
      },
    },
    select: {
      labTestGroups: {
        select: {
          id: true,
          code: true,
          name: true,
          deletedAt: true,
          laboratoriesOnLabTests: {
            select: {
              id: true,
              prices: {
                where: { validTo: null },
                select: { id: true, price: true },
                orderBy: { price: "asc" },
              },
              labTest: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  category: { select: { id: true, name: true } },
                },
              },
              deletedAt: true,
              defaultUnit: { select: { id: true, displayCode: true } },
              notOrderableReason: true,
            },
          },
          notOrderableReason: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const latestLocalTestGroup = rawData.labTestGroups[0];

  return {
    ...latestLocalTestGroup,
    deletedAt: latestLocalTestGroup.deletedAt
      ? formatISO(latestLocalTestGroup.deletedAt)
      : null,
    laboratoriesOnLabTests: latestLocalTestGroup.laboratoriesOnLabTests.map(
      ({ deletedAt, prices, ...restLaboratoriesOnLabTests }) => ({
        ...restLaboratoriesOnLabTests,
        validPrices: prices.map(({ price, ...restPrices }) => ({
          ...restPrices,
          price: price.toString(),
        })),
        deletedAt: deletedAt ? formatISO(deletedAt) : null,
      }),
    ),
  };
}

export async function archiveLocalTestGroup(
  payload: z.infer<typeof ArchiveLocalTestGroupSchema>,
) {
  const rawData = await prisma.labTestGroup.update({
    where: { id: payload.labTestGroupId },
    data: { deletedAt: new Date() },
    select: {
      id: true,
      code: true,
      name: true,
      deletedAt: true,
      notOrderableReason: true,
    },
  });

  return {
    ...rawData,
    deletedAt: rawData.deletedAt ? formatISO(rawData.deletedAt) : null,
  };
}

export async function unarchiveLocalTestGroup(
  payload: z.infer<typeof UnarchiveLocalTestGroupSchema>,
) {
  const rawData = await prisma.labTestGroup.update({
    where: { id: payload.labTestGroupId },
    data: { deletedAt: null },
    select: {
      id: true,
      code: true,
      name: true,
      deletedAt: true,
      notOrderableReason: true,
    },
  });

  return {
    ...rawData,
    deletedAt: rawData.deletedAt ? formatISO(rawData.deletedAt) : null,
  };
}

export async function markLocalTestGroupOrderable(
  payload: z.infer<typeof MarkLocalTestGroupOrderableSchema>,
) {
  const rawData = await prisma.labTestGroup.update({
    where: { id: payload.id },
    data: { notOrderableReason: null },
    select: {
      id: true,
      code: true,
      name: true,
      deletedAt: true,
      notOrderableReason: true,
    },
  });

  return {
    ...rawData,
    deletedAt: rawData.deletedAt ? formatISO(rawData.deletedAt) : null,
  };
}

export async function markLocalTestGroupNotOrderable(
  payload: z.infer<typeof MarkLocalTestGroupNotOrderableSchema>,
) {
  const rawData = await prisma.labTestGroup.update({
    where: { id: payload.id },
    data: { notOrderableReason: payload.reason },
    select: {
      id: true,
      code: true,
      name: true,
      deletedAt: true,
      notOrderableReason: true,
    },
  });

  return {
    ...rawData,
    deletedAt: rawData.deletedAt ? formatISO(rawData.deletedAt) : null,
  };
}

export async function saveLocalTestGroupPrices(
  payload: z.infer<typeof SaveLocalTestGroupPricesSchema>,
) {
  await prisma.price.updateMany({
    where: { labTestGroupId: payload.labTestGroupId, validTo: null },
    data: { validTo: new Date() },
  });

  const rawData = await prisma.labTestGroup.update({
    where: { id: payload.labTestGroupId },
    data: {
      prices: {
        createMany: {
          data: payload.prices.map(({ price, tariffGroupId }) => ({
            price,
            tariffGroupId,
          })),
        },
      },
    },
    select: {
      id: true,
      code: true,
      name: true,
      prices: {
        select: {
          id: true,
          price: true,
          validTo: true,
          validFrom: true,
          tariffGroup: { select: { id: true, code: true, name: true } },
        },
        orderBy: { validFrom: "desc" },
      },
      deletedAt: true,
      laboratoriesOnLabTests: {
        select: {
          id: true,
          prices: {
            where: { validTo: null },
            select: { id: true, price: true },
            orderBy: { price: "asc" },
          },
          labTest: {
            select: {
              id: true,
              code: true,
              name: true,
              category: { select: { id: true, name: true } },
            },
          },
          deletedAt: true,
          defaultUnit: { select: { id: true, displayCode: true } },
          notOrderableReason: true,
        },
      },
      notOrderableReason: true,
    },
  });

  return {
    ...rawData,
    prices: rawData.prices.map(
      ({ price, validFrom, validTo, ...restPrices }) => ({
        ...restPrices,
        price: price.toString(),
        validTo: validTo ? formatISO(validTo) : null,
        validFrom: formatISO(validFrom),
      }),
    ),
    deletedAt: rawData.deletedAt ? formatISO(rawData.deletedAt) : null,
    laboratoriesOnLabTests: rawData.laboratoriesOnLabTests.map(
      ({ deletedAt, prices, ...restLaboratoriesOnLabTests }) => ({
        ...restLaboratoriesOnLabTests,
        validPrices: prices.map(({ price, ...restPrices }) => ({
          ...restPrices,
          price: price.toString(),
        })),
        deletedAt: deletedAt ? formatISO(deletedAt) : null,
      }),
    ),
  };
}

// Tariff Group
export async function getSupportedTariffGroups() {
  return await prisma.tariffGroup.findMany({
    select: { id: true, code: true, name: true },
  });
}

// Helper
export async function getLocalTestGroupsByCode(
  payload: z.infer<typeof GetLocalTestGroupsByCodeSchema>,
) {
  const rawData = await prisma.labTestGroup.findMany({
    where: { code: payload.code, deletedAt: null },
    select: {
      id: true,
      code: true,
      name: true,
      prices: {
        where: { validTo: null },
        select: { id: true, price: true },
        orderBy: { price: "asc" },
      },
      deletedAt: true,
      notOrderableReason: true,
    },
    take: payload.count,
    orderBy: { name: "asc" },
  });

  return rawData.map(({ deletedAt, prices, ...rest }) => ({
    ...rest,
    validPrices: prices.map(({ price, ...restPrices }) => ({
      ...restPrices,
      price: price.toString(),
    })),
    deletedAt: deletedAt ? formatISO(deletedAt) : null,
  }));
}
