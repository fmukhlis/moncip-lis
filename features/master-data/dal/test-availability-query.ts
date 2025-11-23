import z from "zod";
import prisma from "@/lib/prisma";

import {
  GetLocalTestsSchema,
  GetTestCategoriesWithTests,
  GetTestsSchema,
  SaveLocalTestsSchema,
} from "../schema";

export async function getTestCategoriesWithTests(
  options?: z.infer<typeof GetTestCategoriesWithTests>,
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
    take: options?.count,
  });
}

export async function getTests(options?: z.infer<typeof GetTestsSchema>) {
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
    take: options?.count,
  });
}

export async function saveLocalTests({
  labTestIds,
  laboratoryId,
}: z.infer<typeof SaveLocalTestsSchema>) {
  await prisma.laboratoriesOnLabTests.updateManyAndReturn({
    where: { laboratoryId },
    data: { isActive: false },
    select: { id: true },
  });

  await prisma.laboratoriesOnLabTests.createMany({
    data: labTestIds.map((testId) => ({
      laboratoryId,
      labTestId: testId,
    })),
    skipDuplicates: true,
  });

  const validPivotIds = (
    await prisma.laboratoriesOnLabTests.updateManyAndReturn({
      where: { labTestId: { in: labTestIds } },
      data: { isActive: true },
      select: { id: true },
    })
  ).map(({ id }) => id);

  return validPivotIds.length;
}

export async function getLocalTests({
  count,
  laboratoryId,
}: z.infer<typeof GetLocalTestsSchema>) {
  return await prisma.laboratoriesOnLabTests.findMany({
    where: { laboratoryId, isActive: true },
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
    take: count,
  });
}
