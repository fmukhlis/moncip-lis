import z from "zod";
import prisma from "@/lib/prisma";

import {
  GetTestsSchema,
  GetLocalTestsSchema,
  SaveLocalTestsSchema,
  GetTestCategoriesWithTestsSchema,
} from "../schema/test-availability-schema";

export async function getTestCategoriesWithTests(
  payload?: z.infer<typeof GetTestCategoriesWithTestsSchema>,
) {
  return await prisma.category.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      labTests: {
        select: {
          id: true,
          code: true,
          name: true,
          units: {
            select: {
              code: true,
              name: true,
              displayCode: true,
            },
          },
        },
      },
      description: true,
    },
    take: payload?.count,
    orderBy: { name: "asc" },
  });
}

export async function getLocalTests(
  payload: z.infer<typeof GetLocalTestsSchema>,
) {
  return await prisma.laboratoriesOnLabTests.findMany({
    where: { laboratoryId: payload.laboratoryId, deletedAt: null },
    select: {
      id: true,
      labTest: {
        select: {
          id: true,
          code: true,
          name: true,
          units: {
            select: {
              id: true,
              code: true,
              name: true,
              displayCode: true,
            },
          },
        },
      },
    },
    take: payload.count,
    orderBy: { labTest: { name: "asc" } },
  });
}

export async function saveLocalTests(
  payload: z.infer<typeof SaveLocalTestsSchema>,
) {
  await prisma.laboratoriesOnLabTests.updateManyAndReturn({
    where: { laboratoryId: payload.laboratoryId },
    data: { deletedAt: new Date() },
    select: { id: true },
  });

  await prisma.laboratoriesOnLabTests.createMany({
    data: payload.labTestIds.map((testId) => ({
      labTestId: testId,
      laboratoryId: payload.laboratoryId,
    })),
    skipDuplicates: true,
  });

  const validPivotIds = (
    await prisma.laboratoriesOnLabTests.updateManyAndReturn({
      where: { labTestId: { in: payload.labTestIds } },
      data: { deletedAt: null },
      select: { id: true },
    })
  ).map(({ id }) => id);

  return validPivotIds.length;
}

// ---------------------- Helper -----------------------

export async function getTests(payload?: z.infer<typeof GetTestsSchema>) {
  return await prisma.labTest.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      units: {
        select: {
          id: true,
          code: true,
          name: true,
          displayCode: true,
        },
      },
    },
    take: payload?.count,
    orderBy: { name: "asc" },
  });
}
