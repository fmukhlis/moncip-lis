import unitData from "./data/units";
import scaleData from "./data/scale";
import methodData from "./data/methods";
import labTestData from "./data/lab-tests";
import specimenData from "./data/specimens";
import categoryData from "./data/categories";

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// const userData: Prisma.UserCreateInput[] = [];

// for (const u of userData) {
//   await prisma.user.create({ data: u });
// }

export async function main() {
  for (const specimen of specimenData) {
    await prisma.specimen.upsert({
      where: { code: specimen.code },
      update: {},
      create: { ...specimen },
    });
  }

  for (const method of methodData) {
    await prisma.method.upsert({
      where: { code: method.code },
      update: {},
      create: { ...method },
    });
  }

  for (const unit of unitData) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: {},
      create: { ...unit },
    });
  }

  for (const category of categoryData) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: {},
      create: { ...category },
    });
  }

  for (const scale of scaleData) {
    await prisma.scale.upsert({
      where: { code: scale.code },
      update: {},
      create: { ...scale },
    });
  }

  for (const labTest of labTestData) {
    await prisma.labTest.create({
      data: { ...labTest },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
