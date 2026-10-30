import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    transactionOptions: {
      // Prisma's defaults (2s to acquire, 5s to run) assume a local database. A
      // single HIS ingestion issues more than ten sequential queries inside one
      // interactive transaction, which can exceed 5s on a cold, high-latency
      // connection. Tests (and slow networks) raise the budget through the
      // environment instead of the code loosening the guarantee for everyone.
      maxWait: Number(process.env.PRISMA_TRANSACTION_MAX_WAIT_MS ?? 2_000),
      timeout: Number(process.env.PRISMA_TRANSACTION_TIMEOUT_MS ?? 5_000),
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
