import prisma from "@/lib/prisma";
import { seedSpecimenTypes, seedunits } from "@/lib/seed-master-test";

export async function main() {
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
