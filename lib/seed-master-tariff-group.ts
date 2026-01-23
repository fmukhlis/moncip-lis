import prisma from "./prisma";
import tariffGroupData from "@/prisma/data/tariff-group";

export async function seedTariffGroup() {
  await prisma.$transaction(
    tariffGroupData.map((tariffGroup) =>
      prisma.tariffGroup.upsert({
        where: { code: tariffGroup.code },
        update: {},
        create: { ...tariffGroup },
      }),
    ),
  );
}
