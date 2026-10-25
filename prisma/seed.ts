import prisma from "@/lib/prisma";
import { seedSpecimenTypes, seedunits } from "@/lib/seed-master-test";

// import { seedTariffGroup } from "@/lib/seed-master-tariff-group";
// import {
//   seedUnits,
//   seedScales,
//   seedMethods,
//   seedLabTests,
//   seedSpecimens,
//   seedCategories,
// } from "@/lib/seed-master-test";

export async function main() {
  // await seedSpecimens();
  // await seedMethods();
  // await seedCategories();
  // await seedScales();
  // await seedLabTests();
  // await seedTariffGroup();
  await seedunits();
  await seedSpecimenTypes();
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
