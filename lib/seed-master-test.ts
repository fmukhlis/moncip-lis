import prisma from "./prisma";
import unitData from "@/prisma/data/units";
import scaleData from "@/prisma/data/scale";
import methodData from "@/prisma/data/methods";
import labTestData from "@/prisma/data/lab-tests";
import categoryData from "@/prisma/data/categories";
import specimenData from "@/prisma/data/specimens";

export async function seedSpecimens() {
  for (const specimen of specimenData) {
    await prisma.specimen.upsert({
      where: { code: specimen.code },
      update: {},
      create: { ...specimen },
    });
  }
}

export async function seedMethods() {
  for (const method of methodData) {
    await prisma.method.upsert({
      where: { code: method.code },
      update: {},
      create: { ...method },
    });
  }
}

export async function seedUnits() {
  for (const unit of unitData) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: {},
      create: { ...unit },
    });
  }
}

export async function seedCategories() {
  for (const category of categoryData) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: {},
      create: { ...category },
    });
  }
}

export async function seedScales() {
  for (const scale of scaleData) {
    await prisma.scale.upsert({
      where: { code: scale.code },
      update: {},
      create: { ...scale },
    });
  }
}

export async function seedLabTests() {
  for (const labTest of labTestData) {
    await prisma.labTest.upsert({
      where: { code: labTest.code },
      update: {},
      create: { ...labTest },
    });
  }
}
