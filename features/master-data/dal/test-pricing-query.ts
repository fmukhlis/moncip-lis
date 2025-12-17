import z from "zod";
import prisma from "@/lib/prisma";

import {
  SaveLocalTestPricesSchema,
  CreateLocalTestGroupSchema,
  ArchiveLocalTestGroupSchema,
  GetLocalTestGroupsByIdSchema,
  GetLocalTestsWithPricesSchema,
  UnarchiveLocalTestGroupSchema,
  GetLocalTestGroupsByCodeSchema,
  SaveLocalTestGroupPricesSchema,
  GetLocalTestGroupsWithPricesSchema,
} from "../schema/test-pricing-schema";

export async function getLocalTestsWithPrices(
  payload: z.infer<typeof GetLocalTestsWithPricesSchema>,
) {
  return await prisma.laboratoriesOnLabTests.findMany({
    where: { laboratoryId: payload.laboratoryId },
    select: {
      id: true,
      prices: {
        select: {
          id: true,
          price: true,
          tariffGroup: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
      labTest: {
        select: {
          id: true,
          code: true,
          name: true,
          category: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
      deletedAt: true,
      defaultUnit: {
        select: {
          id: true,
          code: true,
          displayCode: true,
        },
      },
      notOrderableReason: true,
    },
    take: payload.count,
    orderBy: { labTest: { name: "asc" } },
  });
}

export async function saveLocalTestPrices(
  payload: z.infer<typeof SaveLocalTestPricesSchema>,
) {
  await prisma.price.updateMany({
    where: {
      laboratoriesOnLabTestsId: payload.laboratoriesOnLabTestsId,
      validTo: null,
    },
    data: { validTo: new Date() },
  });

  const validPrices = (
    await prisma.laboratoriesOnLabTests.update({
      where: { id: payload.laboratoriesOnLabTestsId },
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
      select: { _count: { select: { prices: true } } },
    })
  )._count.prices;

  return validPrices;
}

export async function createLocalTestGroup({
  code,
  name,
  description,
  laboratoryId,
  laboratoriesOnLabTestsIds,
}: z.infer<typeof CreateLocalTestGroupSchema>) {
  return await prisma.laboratory.update({
    where: { id: laboratoryId },
    data: {
      labTestGroups: {
        create: {
          code,
          name,
          description,
          laboratoriesOnLabTests: {
            connect: laboratoriesOnLabTestsIds.map((id) => ({ id })),
          },
        },
      },
    },
  });
}

export async function archiveLocalTestGroup(
  payload: z.infer<typeof ArchiveLocalTestGroupSchema>,
) {
  return await prisma.labTestGroup.update({
    where: { id: payload.labTestGroupId },
    data: { deletedAt: new Date() },
  });
}

export async function unarchiveLocalTestGroup(
  payload: z.infer<typeof UnarchiveLocalTestGroupSchema>,
) {
  return await prisma.labTestGroup.update({
    where: { id: payload.labTestGroupId },
    data: { deletedAt: null },
  });
}

export async function getLocalTestGroupsWithPrices(
  payload: z.infer<typeof GetLocalTestGroupsWithPricesSchema>,
) {
  return await prisma.labTestGroup.findMany({
    where: { laboratoryId: payload.laboratoryId },
    select: {
      id: true,
      code: true,
      name: true,
      prices: {
        select: {
          id: true,
          price: true,
          tariffGroup: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
      deletedAt: true,
      laboratoriesOnLabTests: {
        select: {
          id: true,
          prices: {
            select: {
              id: true,
              price: true,
              tariffGroup: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
          labTest: {
            select: {
              id: true,
              code: true,
              name: true,
              category: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
          deletedAt: true,
          defaultUnit: {
            select: {
              id: true,
              code: true,
              displayCode: true,
            },
          },
          notOrderableReason: true,
        },
      },
      notOrderableReason: true,
    },
    take: payload.count,
    orderBy: { name: "asc" },
  });
}

export async function saveLocalTestGroupPrices(
  payload: z.infer<typeof SaveLocalTestGroupPricesSchema>,
) {
  await prisma.price.updateMany({
    where: { labTestGroupId: payload.labTestGroupId, validTo: null },
    data: { validTo: new Date() },
  });

  const validPrices = (
    await prisma.labTestGroup.update({
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
      select: { _count: { select: { prices: true } } },
    })
  )._count.prices;

  return validPrices;
}

export async function getSupportedTariffGroups() {
  return await prisma.tariffGroup.findMany({
    select: { id: true, code: true, name: true },
  });
}

// ---------------------- Helper -----------------------

export async function getLocalTestGroupById(
  payload: z.infer<typeof GetLocalTestGroupsByIdSchema>,
) {
  return await prisma.labTestGroup.findUnique({
    where: { id: payload.id },
  });
}

export async function getLocalTestGroupsByCode(
  payload: z.infer<typeof GetLocalTestGroupsByCodeSchema>,
) {
  return await prisma.labTestGroup.findMany({
    where: { code: payload.code, deletedAt: null },
  });
}
