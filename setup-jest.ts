import prisma from "./lib/prisma";
import { seedTariffGroup } from "./lib/seed-master-tariff-group";

import {
  seedCategories,
  seedLabTests,
  seedMethods,
  seedScales,
  seedSpecimens,
  seedUnits,
} from "./lib/seed-master-test";

beforeAll(async () => {
  await seedSpecimens();
  await seedMethods();
  await seedUnits();
  await seedCategories();
  await seedScales();
  await seedLabTests();

  await seedTariffGroup();
}, 20000);

afterAll(async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
});
