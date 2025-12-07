import z from "zod";
import prisma from "@/lib/prisma";

import {
  GetSupportedUnitsForTest,
  SaveLocalTestReferenceRangesSchema,
  GetLocalTestsWithReferenceRangesSchema,
} from "../schema";

export async function getLocalTestsWithReferenceRanges({
  count,
  laboratoryId,
}: z.infer<typeof GetLocalTestsWithReferenceRangesSchema>) {
  const rawData = await prisma.laboratoriesOnLabTests.findMany({
    where: {
      laboratoryId,
    },
    take: count,
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
              displayCode: true,
            },
          },
          category: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          possibleValues: true,
        },
      },
      isActive: true,
      defaultUnit: {
        select: {
          id: true,
          code: true,
          displayCode: true,
        },
      },
      referenceRanges: {
        where: {
          validTo: null,
        },
        select: {
          id: true,
          unit: {
            select: {
              id: true,
              code: true,
              displayCode: true,
            },
          },
          ageMax: true,
          ageMin: true,
          gender: true,
          valueLow: true,
          valueHigh: true,
          normalValues: true,
        },
      },
    },
    orderBy: {
      labTest: {
        name: "asc",
      },
    },
  });

  return rawData.map(({ referenceRanges, ...rest }) => ({
    ...rest,
    referenceRanges: referenceRanges.map(
      ({ valueLow, valueHigh, ...rest }) => ({
        ...rest,
        valueLow: valueLow?.toString() ?? null,
        valueHigh: valueHigh?.toString() ?? null,
      }),
    ),
  }));
}

export async function saveLocalTestReferenceRanges({
  refRanges,
  defaultUnitId,
  laboratoriesOnLabTestsId,
}: z.infer<typeof SaveLocalTestReferenceRangesSchema>) {
  await prisma.referenceRange.updateMany({
    where: {
      laboratoriesOnLabTestsId,
      validTo: null,
    },
    data: {
      validTo: new Date(),
    },
  });

  const validReferenceRangesCount = (
    await prisma.laboratoriesOnLabTests.update({
      where: { id: laboratoriesOnLabTestsId },
      data: {
        defaultUnit: defaultUnitId
          ? {
              connect: {
                id: defaultUnitId,
              },
            }
          : undefined,
        referenceRanges: {
          createMany: {
            data: refRanges.map((refRange) =>
              refRange.kind === "non-numeric"
                ? {
                    unitId: defaultUnitId,
                    ageMax: refRange.ageMax,
                    ageMin: refRange.ageMin,
                    gender: refRange.gender,
                    normalValues: refRange.normalValues,
                  }
                : {
                    unitId: defaultUnitId,
                    ageMax: refRange.ageMax,
                    ageMin: refRange.ageMin,
                    gender: refRange.gender,
                    valueLow: refRange.valueLow,
                    valueHigh: refRange.valueHigh,
                  },
            ),
          },
        },
      },
      select: {
        _count: {
          select: {
            referenceRanges: true,
          },
        },
      },
    })
  )._count.referenceRanges;

  return validReferenceRangesCount;
}

export async function getSupportedUnitsForTest({
  laboratoriesOnLabTestsId,
}: z.infer<typeof GetSupportedUnitsForTest>) {
  return await prisma.laboratoriesOnLabTests.findFirst({
    where: {
      id: laboratoriesOnLabTestsId,
    },
    select: {
      labTest: {
        select: {
          id: true,
          code: true,
          name: true,
          units: {
            select: {
              id: true,
              code: true,
              displayCode: true,
            },
          },
        },
      },
    },
  });
}
