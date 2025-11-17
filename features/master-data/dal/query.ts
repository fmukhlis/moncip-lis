import prisma from "@/lib/prisma";

export async function getMasterTestCategoriesDeep() {
  return await prisma.category.findMany({
    select: {
      code: true,
      description: true,
      labTests: {
        select: {
          code: true,
          name: true,
          possibleValues: true,
          scale: {
            select: {
              abbreviation: true,
              code: true,
              name: true,
            },
          },
          units: {
            select: {
              code: true,
              displayCode: true,
              name: true,
            },
          },
          specimens: {
            select: {
              abbreviation: true,
              code: true,
              name: true,
            },
          },
        },
      },
      name: true,
    },
  });
}

export async function getMasterTests() {
  return await prisma.labTest.findMany({
    select: {
      code: true,
      name: true,
      possibleValues: true,
      scale: {
        select: {
          abbreviation: true,
          code: true,
          name: true,
        },
      },
      units: {
        select: {
          code: true,
          displayCode: true,
          name: true,
        },
      },
      specimens: {
        select: {
          abbreviation: true,
          code: true,
          name: true,
        },
      },
    },
  });
}

export async function saveLocalTests(
  laboratoryId: string,
  labTestCodes: string[],
) {
  return await prisma.laboratory.update({
    where: {
      id: laboratoryId,
    },
    data: {
      labTests: {
        set: labTestCodes.map((code) => ({ code })),
      },
    },
    include: {
      labTests: {
        select: {
          code: true,
          name: true,
          possibleValues: true,
          scale: {
            select: {
              abbreviation: true,
              code: true,
              name: true,
            },
          },
          units: {
            select: {
              code: true,
              displayCode: true,
              name: true,
            },
          },
          specimens: {
            select: {
              abbreviation: true,
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getLocalTests(laboratoryId: string) {
  return await prisma.laboratory.findFirst({
    where: {
      id: laboratoryId,
    },
    include: {
      labTests: {
        select: {
          code: true,
          name: true,
          possibleValues: true,
          scale: {
            select: {
              abbreviation: true,
              code: true,
              name: true,
            },
          },
          units: {
            select: {
              code: true,
              displayCode: true,
              name: true,
            },
          },
          specimens: {
            select: {
              abbreviation: true,
              code: true,
              name: true,
            },
          },
        },
      },
      labTestGroups: true,
    },
  });
}
