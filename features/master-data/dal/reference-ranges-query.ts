import z from "zod";
import prisma from "@/lib/prisma";

import { formatISO } from "date-fns";
import {
  GetSupportedUnitsForTestSchema,
  SaveLocalTestReferenceRangesSchema,
  GetLocalTestsWithReferenceRangesSchema,
} from "../schema/reference-ranges-schema";

export async function getLocalTestsWithReferenceRanges(
  payload: z.infer<typeof GetLocalTestsWithReferenceRangesSchema>,
) {
  const rawData = await prisma.laboratoriesOnLabTests.findMany({
    where: { laboratoryId: payload.laboratoryId },
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
      deletedAt: true,
      defaultUnit: {
        select: {
          id: true,
          code: true,
          displayCode: true,
        },
      },
      referenceRanges: {
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
          validTo: true,
          valueLow: true,
          valueHigh: true,
          validFrom: true,
          ageMaxUnit: true,
          ageMinUnit: true,
          normalValues: true,
        },
      },
      notOrderableReason: true,
    },
    take: payload.count,
    orderBy: {
      labTest: {
        name: "asc",
      },
    },
  });

  return rawData.map(({ referenceRanges, ...rest }) => ({
    ...rest,
    deletedAt: rest.deletedAt ? formatISO(rest.deletedAt) : null,
    referenceRanges: referenceRanges.map(
      ({ valueLow, valueHigh, validFrom, validTo, ...rest }) => ({
        ...rest,
        valueLow: valueLow?.toString() ?? null,
        valueHigh: valueHigh?.toString() ?? null,
        validFrom: formatISO(validFrom),
        validTo: validTo ? formatISO(validTo) : null,
      }),
    ),
  }));
}

export async function saveLocalTestReferenceRanges(
  payload: z.infer<typeof SaveLocalTestReferenceRangesSchema>,
) {
  await prisma.referenceRange.updateMany({
    where: {
      laboratoriesOnLabTestsId: payload.laboratoriesOnLabTestsId,
      validTo: null,
    },
    data: {
      validTo: new Date(),
    },
  });

  const validReferenceRangesCount = (
    await prisma.laboratoriesOnLabTests.update({
      where: { id: payload.laboratoriesOnLabTestsId },
      data: {
        defaultUnit: payload.defaultUnitId
          ? {
              connect: {
                id: payload.defaultUnitId,
              },
            }
          : undefined,
        referenceRanges: {
          createMany: {
            data: payload.refRanges.map((refRange) =>
              refRange.kind === "non-numeric"
                ? {
                    unitId: payload.defaultUnitId,
                    ageMax: refRange.ageMax,
                    ageMaxUnit: refRange.ageMaxUnit,
                    ageMin: refRange.ageMin,
                    ageMinUnit: refRange.ageMinUnit,
                    gender: refRange.gender,
                    normalValues: refRange.normalValues,
                  }
                : {
                    unitId: payload.defaultUnitId,
                    ageMax: refRange.ageMax,
                    ageMaxUnit: refRange.ageMaxUnit,
                    ageMin: refRange.ageMin,
                    ageMinUnit: refRange.ageMinUnit,
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

// ---------------------- Helper -----------------------

export async function getSupportedUnitsForTest(
  payload: z.infer<typeof GetSupportedUnitsForTestSchema>,
) {
  return await prisma.laboratoriesOnLabTests.findFirst({
    where: { id: payload.laboratoriesOnLabTestsId },
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
