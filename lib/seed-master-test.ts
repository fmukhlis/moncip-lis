import prisma from "./prisma";
import unitData from "@/prisma/data/units";
import scaleData from "@/prisma/data/scale";
import methodData from "@/prisma/data/methods";
import labTestData from "@/prisma/data/lab-tests";
import categoryData from "@/prisma/data/categories";
import specimenData from "@/prisma/data/specimens";

export async function seedSpecimens() {
  await prisma.$transaction(
    specimenData.map((specimen) =>
      prisma.specimen.upsert({
        where: { code: specimen.code },
        update: {},
        create: { ...specimen },
      }),
    ),
  );
}

export async function seedMethods() {
  await prisma.$transaction(
    methodData.map((method) =>
      prisma.method.upsert({
        where: { code: method.code },
        update: {},
        create: { ...method },
      }),
    ),
  );
}

export async function seedUnits() {
  await prisma.$transaction(
    unitData.map((unit) =>
      prisma.unit.upsert({
        where: { code: unit.code },
        update: {},
        create: { ...unit },
      }),
    ),
  );
}

export async function seedCategories() {
  await prisma.$transaction(
    categoryData.map((category) =>
      prisma.category.upsert({
        where: { code: category.code },
        update: {},
        create: { ...category },
      }),
    ),
  );
}

export async function seedScales() {
  await prisma.$transaction(
    scaleData.map((scale) =>
      prisma.scale.upsert({
        where: { code: scale.code },
        update: {},
        create: { ...scale },
      }),
    ),
  );
}

export async function seedLabTests() {
  await prisma.$transaction(
    labTestData.map((labTest) =>
      prisma.labTest.upsert({
        where: { code: labTest.code },
        update: {},
        create: { ...labTest },
      }),
    ),
  );
}
