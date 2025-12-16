import prisma from "./prisma";
import tariffGroupData from "@/prisma/data/tariff-group";

export async function seedTariffGroup() {
  for (const tariffGroup of tariffGroupData) {
    await prisma.tariffGroup.upsert({
      where: { code: tariffGroup.code },
      update: {},
      create: { ...tariffGroup },
    });
  }
}
